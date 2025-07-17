import { useSession } from 'next-auth/react'
import Head from 'next/head'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/videos')
        .then(res => res.json())
        .then(data => {
          setVideos(data.videos)
          setIsLoading(false)
        })
    }
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>Please sign in to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>My Videos | AI Video Generator</title>
      </Head>

      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">My Videos</h1>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-xl mb-4">You haven't generated any videos yet.</p>
            <Link href="/generate" className="text-blue-400 hover:underline">Generate your first video</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="relative pt-[56.25%]">
                  <video className="absolute top-0 left-0 w-full h-full object-cover">
                    <source src={video.thumbnailUrl || video.videoUrl} type="video/mp4" />
                  </video>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{video.prompt}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between">
                    <Link href={`/video/${video.id}`} className="text-blue-400 hover:underline text-sm">
                      View
                    </Link>
                    <button className="text-gray-400 hover:text-white text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}