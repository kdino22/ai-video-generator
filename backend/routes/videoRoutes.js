const express = require('express')
const router = express.Router()
const Video = require('../models/Video')
const { generateVideo } = require('../services/videoService')
const auth = require('../middleware/auth')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// Generate new video
router.post('/generate-video', auth, upload.single('image'), async (req, res) => {
  try {
    const { prompt, style, duration } = req.body
    const image = req.file ? req.file.buffer : null

    // Check user credits
    if (req.user.credits <= 0) {
      return res.status(402).json({ error: 'Insufficient credits' })
    }

    // Create video record
    const video = new Video({
      userId: req.user.id,
      prompt,
      style,
      duration,
      status: 'processing'
    })

    await video.save()

    // Deduct credit
    req.user.credits -= 1
    await req.user.save()

    // Initiate video generation (async)
    generateVideo(video, image)

    res.status(202).json({
      message: 'Video generation started',
      videoId: video._id
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get user's videos
router.get('/', auth, async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json({ videos })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get video details
router.get('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({ video })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router