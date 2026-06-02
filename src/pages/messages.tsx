import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Conversation {
  id: string
  last_message_text: string | null
  last_message_at: string | null
  unread_count: number
  other_participant: { id: string; name: string; role: string }
}

const AVATAR_COLORS = [
  '#1DB954', '#E91429', '#1877F2', '#FF6B35', '#9B59B6', '#1ABC9C', '#F39C12',
]
function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Yesterday'
  return new Date(iso).toLocaleDateString()
}

export default function MessagesPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const fetchConversations = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/messages/conversations', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setConversations(data)
    }
    setFetching(false)
  }, [session])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Messages | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-white mb-1">Messages</h1>
            <p className="text-[#B3B3B3] text-sm">Your direct message threads with musicians and venues.</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
            {fetching ? (
              <div className="py-16 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-[#282828] rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-[#B3B3B3]/30" />
                </div>
                <h2 className="text-white font-bold text-xl mb-2">No messages yet</h2>
                <p className="text-[#B3B3B3] text-sm max-w-sm mb-6">
                  Visit a musician or venue profile and tap &ldquo;Message&rdquo; to start a conversation.
                </p>
                <Link
                  href="/musicians"
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all"
                >
                  Browse Musicians
                </Link>
              </div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 min-h-[72px]"
                >
                  <div className="w-2 flex-shrink-0 flex justify-center">
                    {conv.unread_count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                    )}
                  </div>

                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0"
                    style={{ backgroundColor: avatarColor(conv.other_participant.name) }}
                  >
                    {conv.other_participant.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`font-semibold text-sm truncate ${conv.unread_count > 0 ? 'text-white' : 'text-[#B3B3B3]'}`}>
                        {conv.other_participant.name}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-xs text-white/30 flex-shrink-0">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    {conv.last_message_text && (
                      <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message_text}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
