import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  ArrowLeft, Pencil, Send, ExternalLink, MessageSquare, X,
} from 'lucide-react'
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

interface Props {
  onClose: () => void
  onUnreadCountChange: (n: number) => void
  /** If set, jump straight into this conversation on open */
  openConversationId?: string | null
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function MessagesDropdown({ onClose, onUnreadCountChange, openConversationId }: Props) {
  const { user, session } = useAuth()
  const router = useRouter()

  const [view, setView] = useState<'inbox' | 'chat'>('inbox')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${session?.access_token ?? ''}` }),
    [session]
  )

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/messages/conversations', { headers: authHeader() })
    if (!res.ok) return
    const data: Conversation[] = await res.json()
    setConversations(data)
    const total = data.reduce((s, c) => s + c.unread_count, 0)
    onUnreadCountChange(total)
    return data
  }, [session, authHeader, onUnreadCountChange])

  useEffect(() => {
    fetchConversations().then((data) => {
      setLoadingConvs(false)
      if (openConversationId && data) {
        const target = data.find((c) => c.id === openConversationId)
        if (target) openChat(target)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch messages for active conversation ────────────────────────────────

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

    // Mark as read
    fetch(`/api/messages/${activeConv.id}/read`, {
      method: 'PATCH',
      headers: authHeader(),
    }).then(() => fetchConversations())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, view])

  // ── Focus input when entering chat ───────────────────────────────────────

  useEffect(() => {
    if (view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 260)
    }
  }, [view])

  // ── Realtime subscription ─────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`messages-dropdown-${user.id}`)
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
              // Mark read immediately since the user is looking at this chat
              fetch(`/api/messages/${current.id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
              }).then(() => fetchConversations())
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

  // ── Actions ───────────────────────────────────────────────────────────────

  function openChat(conv: Conversation) {
    setActiveConv(conv)
    setView('chat')
  }

  function backToInbox() {
    setView('inbox')
    setActiveConv(null)
    setMessages([])
    setDraft('')
    fetchConversations()
  }

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

  // ── Panel dimensions (animate between inbox / chat) ───────────────────────

  const panelW = view === 'chat' ? 420 : 380
  const panelH = view === 'chat' ? 560 : 480

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
        onClick={onClose}
      />

      {/*
        Desktop: floating dropdown below the icon
        Mobile: fixed bottom sheet (full width, slides up from bottom)
      */}
      <div
        className="
          fixed md:absolute
          inset-x-0 bottom-0 md:inset-auto md:right-0 md:top-full md:mt-2
          z-50
          bg-[#1A1A1A] border border-white/10
          md:rounded-2xl rounded-t-2xl
          shadow-2xl shadow-black/70
          flex flex-col overflow-hidden
          transition-all duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)]
        "
        style={{
          width: `min(100vw, ${panelW}px)`,
          height: `min(92dvh, ${panelH}px)`,
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          {view === 'inbox' ? (
            <>
              <span className="text-white font-semibold text-sm">Messages</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onClose(); router.push('/musicians') }}
                  className="p-2 text-[#B3B3B3] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="New message"
                  aria-label="Start a new conversation"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[#B3B3B3] hover:text-white hover:bg-white/5 rounded-lg transition-colors md:hidden"
                  aria-label="Close messages"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={backToInbox}
                className="p-1.5 text-[#B3B3B3] hover:text-white hover:bg-white/5 rounded-lg transition-colors -ml-1"
                aria-label="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-white font-semibold text-sm truncate mx-3 flex-1 text-center">
                {activeConv?.other_participant.name}
              </span>
              <button
                onClick={() => {
                  onClose()
                  router.push(`/messages/${activeConv?.id}`)
                }}
                className="p-1.5 text-[#B3B3B3] hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                title="Open full view"
                aria-label="Open conversation in full view"
              >
                {/* "open in new tab" style icon: square with arrow pointing to top-right corner */}
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="10" height="10" rx="1.5" />
                  <path d="M8 2h6v6" />
                  <path d="M14 2L8 8" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {view === 'inbox' ? (
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="py-10 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 px-4 text-center">
                <MessageSquare className="w-10 h-10 text-white/10" />
                <p className="text-[#B3B3B3] text-sm">No messages yet</p>
                <p className="text-white/30 text-xs">
                  Visit a musician or venue profile and tap &ldquo;Message&rdquo; to start a conversation.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openChat(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 min-h-[60px]"
                >
                  {/* Unread dot */}
                  <div className="w-2 flex-shrink-0 flex justify-center">
                    {conv.unread_count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                    style={{ backgroundColor: avatarColor(conv.other_participant.name) }}
                  >
                    {conv.other_participant.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm font-medium truncate ${conv.unread_count > 0 ? 'text-white' : 'text-[#B3B3B3]'}`}>
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
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            {/* ── Message thread ────────────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {loadingMsgs ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm">No messages yet. Say hi!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      style={{
                        animation: 'msgPop 200ms cubic-bezier(.34,1.56,.64,1) both',
                      }}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine
                            ? 'bg-[#1DB954]/20 border border-[#1DB954]/40 text-white rounded-br-md'
                            : 'bg-[#2A2A2A] text-[#E0E0E0] rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-white/25 mt-0.5 px-1">
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ────────────────────────────────────────────── */}
            <div className="border-t border-white/10 px-3 py-3 flex items-center gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-[#2A2A2A] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 placeholder:text-white/30 focus:outline-none focus:border-[#1DB954]/40 transition-colors min-h-[44px]"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#1DB954] disabled:bg-[#1DB954]/30 hover:bg-[#1ed760] disabled:cursor-not-allowed text-black flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
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
