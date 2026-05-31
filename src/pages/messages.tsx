import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Messages | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Messages</h1>
            <p className="text-[#B3B3B3]">Your direct message threads with musicians and venues.</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-16 h-16 bg-[#282828] rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#B3B3B3]/30" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">No messages yet</h2>
              <p className="text-[#B3B3B3] text-sm max-w-sm">
                When you contact a musician or a venue reaches out to you, your conversations will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
