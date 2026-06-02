import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OtherParticipant {
  id: string
  name: string
  role: string
}

interface Conversation {
  id: string
  participant_one_id: string
  participant_two_id: string
  last_message_text: string | null
  last_message_at: string | null
  unread_count: number
  other_participant: OtherParticipant
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Yesterday'
  return new Date(iso).toLocaleDateString()
}

const AVATAR_COLORS = [
  '#1DB954', '#E91429', '#1877F2', '#FF6B35', '#9B59B6', '#1ABC9C', '#F39C12',
]
function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
}

function roleLabel(role: string) {
  if (role === 'musician') return 'Musician'
  if (role === 'venue') return 'Venue'
  return ''
}

function profileHref(id: string, role: string) {
  if (role === 'musician') return `/musicians/${id}`
  if (role === 'venue') return `/venues/${id}`
  return '#'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConversationPage() {
  const router = useRouter()
  const { id } = router.query
  const conversationId = typeof id === 'string' ? id : null

  const { user, session, loading: authLoading } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${session?.access_token ?? ''}` }),
    [session]
  )

  // ── Redirect if not logged in ─────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/messages/conversations', { headers: authHeader() })
    if (!res.ok) return
    const data: Conversation[] = await res.json()
    setConversations(data)
  }, [session, authHeader])

  useEffect(() => {
    if (!session) return
    fetchConversations().finally(() => setLoadingConvs(false))
  }, [session, fetchConversations])

  // ── Set active conversation from URL ──────────────────────────────────────

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return
    const found = conversations.find((c) => c.id === conversationId)
    if (found) setActiveConv(found)
  }, [conversationId, conversations])

  // ── Fetch messages ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeConv || !session) return
    setLoadingMsgs(true)
    setMessages([])

    fetch(`/api/messages/${activeConv.id}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages(data)
        setLoadingMsgs(false)
      })

    fetch(`/api/messages/${activeConv.id}/read`, {
      method: 'PATCH',
      headers: authHeader(),
    }).then(() => fetchConversations())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`messages-page-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const incoming = payload.new as Message
          if (incoming.sender_id === user.id) return

          setActiveConv((current) => {
            if (current?.id === incoming.conversation_id) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === incoming.id)) return prev
                return [...prev, incoming]
              })
              fetch(`/api/messages/${current.id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
              })
            } else {
              fetchConversations()
            }
            return current
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Send message ──────────────────────────────────────────────────────────

  async function sendMessage() {
    if (!draft.trim() || !activeConv || sending || !session) return
    setSending(true)
    const content = draft.trim()
    setDraft('')

    const res = await fetch(`/api/messages/${activeConv.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      const msg: Message = await res.json()
      setMessages((prev) => [...prev, msg])
      fetchConversations()
    }
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function selectConversation(conv: Conversation) {
    setActiveConv(conv)
    setMobileView('chat')
    router.push(`/messages/${conv.id}`, undefined, { shallow: true })
  }

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (authLoading || !user) return null

  // ── Conversation sidebar list ─────────────────────────────────────────────

  const sidebarList = (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-white/5 flex-shrink-0">
        <h2 className="text-white font-bold text-base">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {loadingConvs ? (
          <div className="py-10 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-[#B3B3B3] text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors text-left min-h-[60px] ${
                activeConv?.id === conv.id ? 'bg-[#1DB954]/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-2 flex-shrink-0 flex justify-center">
                {conv.unread_count > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                )}
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                style={{ backgroundColor: avatarColor(conv.other_participant.name) }}
              >
                {conv.other_participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <span className={`text-sm font-medium truncate ${conv.unread_count > 0 ? 'text-white' : 'text-[#B3B3B3]'}`}>
                    {conv.other_participant.name}
                  </span>
                  {conv.last_message_at && (
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  )}
                </div>
                {conv.last_message_text && (
                  <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message_text}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )

  // ── Chat panel ────────────────────────────────────────────────────────────

  const chatPanel = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0">
        {/* Mobile back button */}
        <button
          onClick={() => setMobileView('list')}
          className="md:hidden p-1.5 -ml-1.5 text-[#B3B3B3] hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {activeConv && (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
              style={{ backgroundColor: avatarColor(activeConv.other_participant.name) }}
            >
              {activeConv.other_participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {activeConv.other_participant.name}
              </p>
              {activeConv.other_participant.role && (
                <p className="text-xs text-[#1DB954] font-medium">
                  {roleLabel(activeConv.other_participant.role)}
                </p>
              )}
            </div>
            <Link
              href={profileHref(activeConv.other_participant.id, activeConv.other_participant.role)}
              className="flex items-center gap-1.5 text-xs text-[#B3B3B3] hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-colors min-h-[36px]"
            >
              <User className="w-3 h-3" />
              Profile
            </Link>
          </>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <MessageSquare className="w-12 h-12 text-white/10" />
            <p className="text-[#B3B3B3] text-sm">Select a conversation to start messaging</p>
          </div>
        ) : loadingMsgs ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user.id
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                style={{ animation: 'msgPop 200ms cubic-bezier(.34,1.56,.64,1) both' }}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMine
                      ? 'bg-[#1DB954]/20 border border-[#1DB954]/40 text-white rounded-br-md'
                      : 'bg-[#2A2A2A] text-[#E0E0E0] rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-white/25 mt-0.5 px-1">{timeAgo(msg.created_at)}</span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {activeConv && (
        <div className="border-t border-white/5 px-4 py-3 flex items-center gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-[#2A2A2A] border border-white/10 text-white text-sm rounded-xl px-4 py-3 placeholder:text-white/30 focus:outline-none focus:border-[#1DB954]/40 transition-colors min-h-[44px]"
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-[#1DB954] disabled:bg-[#1DB954]/30 hover:bg-[#1ed760] disabled:cursor-not-allowed text-black flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Head>
        <title>
          {activeConv ? `${activeConv.other_participant.name} | Messages` : 'Messages'} | Band Bridge
        </title>
      </Head>

      <div className="min-h-screen bg-[#121212] pt-16 flex flex-col">
        {/* Desktop: sidebar + chat split */}
        <div className="hidden md:flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          {/* Sidebar */}
          <div className="w-[300px] flex-shrink-0 bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
            {sidebarList}
          </div>

          {/* Chat */}
          <div className="flex-1 bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
            {chatPanel}
          </div>
        </div>

        {/* Mobile: toggle between list and chat */}
        <div className="md:hidden flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 64px)' }}>
          {mobileView === 'list' ? (
            <div className="flex-1 bg-[#1E1E1E]">{sidebarList}</div>
          ) : (
            <div className="flex-1 bg-[#1E1E1E] flex flex-col">{chatPanel}</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes msgPop {
          from { opacity: 0; transform: scale(0.85) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}
