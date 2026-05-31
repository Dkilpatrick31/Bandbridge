import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Bell, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  link: string | null
  created_at: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  booking_request:   <Calendar className="w-4 h-4 text-[#1DB954]" />,
  booking_confirmed: <CheckCircle className="w-4 h-4 text-[#1DB954]" />,
  booking_cancelled: <XCircle className="w-4 h-4 text-red-400" />,
  new_message:       <MessageSquare className="w-4 h-4 text-blue-400" />,
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setNotifications(data)
        setFetching(false)
      })
  }, [user])

  async function markRead(id: string, link: string | null) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    if (link) router.push(link)
  }

  if (loading || !user) return null

  return (
    <>
      <Head>
        <title>Notifications | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Notifications</h1>
            <p className="text-[#B3B3B3]">Booking updates, messages, and activity alerts.</p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
            {fetching ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="w-16 h-16 bg-[#282828] rounded-2xl flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-[#B3B3B3]/30" />
                </div>
                <h2 className="text-white font-bold text-xl mb-2">No notifications yet</h2>
                <p className="text-[#B3B3B3] text-sm max-w-sm">
                  Booking requests, confirmations, cancellations, and new messages will appear here.
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id, n.link)}
                    className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/5 ${
                      !n.read ? 'bg-[#1DB954]/5' : ''
                    } ${i < notifications.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] ?? <Bell className="w-4 h-4 text-[#B3B3B3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-[#B3B3B3]' : 'text-white'}`}>{n.message}</p>
                      <p className="text-xs text-[#B3B3B3]/60 mt-0.5">
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-[#1DB954] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
