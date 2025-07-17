import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Head from 'next/head'

const styles = [
  { id: 'realistic', name: 'Realistic' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'anime', name: 'Anime' },
  { id: '3d-animation', name: '3D Animation' },
  { id: 'watercolor', name: 'Watercolor' },
]

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(styles[0].id)
  const [duration, setDuration] = useState(10)
  const [image, setImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (session) {
      // Fetch user credits
      fetch('/api/credits')
        .then(res => res.json())
        .then(data => setCredits(data.credits))
    }
  }, [session])

  const handleGenerate = async () => {
    if (!session) {
      signIn()
      return
    }

    if (credits <= 0) {
      alert('You have no credits left. Please purchase more to generate videos.')
      return
    }

    setIsGenerating(true)
    
    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('style', selectedStyle)
    formData.append('duration', duration)
    if (image) {
      formData.append('image', image)
    }

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        setGeneratedVideo(data)
        setCredits(credits - 1)
      } else {
        throw new Error(data.error || 'Failed to generate video')
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Generate AI Video | AI Video Generator</title>
      </Head>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Generate AI Video</h1>
        
        {session ? (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <p>Your credits: <span className="font-bold">{credits}</span></p>
            <Link href="/pricing" className="text-blue-400 hover:underline">Get more credits</Link>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <p>You need to <button onClick={() => signIn()} className="text-blue-400 hover:underline">sign in</button> to generate videos.</p>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-lg font-medium mb-2">Describe your video</label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="A futuristic city at sunset with flying cars..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="image" className="block text-lg font-medium mb-2">Optional: Upload an image (for image-to-video)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700"
              onChange={handleImageUpload}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="style" className="block text-lg font-medium mb-2">Style</label>
              <select
                id="style"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
              >
                {styles.map((style) => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-lg font-medium mb-2">Duration: {duration}s</label>
              <input
                type="range"
                id="duration"
                min="5"
                max="60"
                step="1"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-300 ${(isGenerating || !prompt) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </button>
        </div>

        {generatedVideo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Your Generated Video</h2>
            <div className="mb-4">
              <video controls className="w-full rounded-lg">
                <source src={generatedVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={generatedVideo.videoUrl}
                download={`ai-video-${generatedVideo.id}.mp4`}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
              >
                Download
              </a>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                Share
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                Regenerate
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}