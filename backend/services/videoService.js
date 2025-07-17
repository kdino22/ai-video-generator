const Video = require('../models/Video')
const { uploadToCloudinary } = require('./storageService')
const Replicate = require('replicate')

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})

// Connect to video service (placeholder for actual initialization)
const connectToVideoService = () => {
  console.log('Connected to video generation service')
}

const generateVideo = async (video, image) => {
  try {
    let output
    const input = {
      prompt: video.prompt,
      fps: 24,
      num_frames: Math.min(Math.floor(video.duration * 24), 144), // Max 6 seconds at 24fps
      model: 'xl',
      width: 1024,
      height: 576,
    }

    if (image) {
      // Image-to-video generation
      const imageUrl = await uploadToCloudinary(image, 'image')
      output = await replicate.run(
        'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
        {
          input: {
            ...input,
            image: imageUrl
          }
        }
      )
    } else {
      // Text-to-video generation
      output = await replicate.run(
        'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
        { input }
      )
    }

    // Upload video to cloud storage
    const videoUrl = await uploadToCloudinary(output[0], 'video')

    // Update video record
    video.videoUrl = videoUrl
    video.status = 'completed'
    video.completedAt = new Date()
    await video.save()

  } catch (error) {
    console.error('Video generation error:', error)
    video.status = 'failed'
    video.error = error.message
    await video.save()
  }
}

module.exports = {
  connectToVideoService,
  generateVideo
}