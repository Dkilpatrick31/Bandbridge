import { useState, useEffect, useCallback } from 'react'
import { CalendarX2, MapPin, Clock, DollarSign, CheckCircle, XCircle, Music2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

interface VenueBooking {
  id: string
  musician_id: string
  status: BookingStatus
  event_date: string
  start_time: string
  end_time: string
  set_length_minutes: number | null
  offered_rate: number
  agreed_rate: number | null
  message: string
  venue_notes: string | null
  created_at: string
  musicians: {
    stage_name: string | null
    city: string | null
    state: string | null
    genre: string[] | null
    hourly_rate: number | null
  } | null
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-amber-500/15  text-amber-400  border-amber-500/30',
  accepted:  'bg-green-500/15  text-green-400  border-green-500/30',
  declined:  'bg-red-500/15    text-red-400    border-red-500/30',
  cancelled: 'bg-gray-500/15   text-gray-400   border-gray-500/30',
  completed: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending', accepted: 'Accepted', declined: 'Declined',
  cancelled: 'Cancelled', completed: 'Completed',
}

function fmt12(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}
function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

const todayStr = new Date().toISOString().split('T')[0]

interface Props { initialTab?: string }

export default function VenueBookingsPanel({ initialTab }: Props) {
  const [bookings, setBookings] = useState<VenueBooking[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [acting, setActing]     = useState<string | null>(null)

  const TABS = ['requests', 'upcoming', 'past'] as const
  type Tab = typeof TABS[number]
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab && TABS.includes(initialTab as Tab)) return initialTab as Tab
    return 'requests'
  })

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bookings/venue', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (!res.ok) throw new Error('Failed to load bookings')
      setBookings(await res.json())
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function updateStatus(id: string, status: string) {
    setActing(id + ':' + status)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to update booking')
        return
      }
      await fetchBookings()
    } catch {
      setError('Failed to update booking')
    } finally {
      setActing(null)
    }
  }

  const grouped = {
    requests: bookings.filter(b => b.status === 'pending'),
    upcoming: bookings.filter(b => b.status === 'accepted' && b.event_date >= todayStr),
    past:     bookings.filter(b =>
      b.status === 'completed' || b.status === 'declined' || b.status === 'cancelled' ||
      (b.status === 'accepted' && b.event_date < todayStr)
    ),
  }

  const TAB_LABELS: Record<Tab, string> = {
    requests: 'Requests',
    upcoming: 'Upcoming',
    past: 'Past / History',
  }

  const shown = grouped[tab]

  return (
    <div className="mt-6 bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
      {/* Header + tabs */}
      <div className="px-6 pt-6 pb-0 border-b border-white/5">
        <h2 className="text-white font-bold text-lg mb-4">Booking Requests</h2>
        <div className="flex gap-1 -mx-1">
          {TABS.map(t => {
            const count = grouped[t].length
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors min-h-[44px] ${
                  tab === t
                    ? 'text-white bg-[#282828] border-b-2 border-[#1DB954]'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {TAB_LABELS[t]}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full border ${
                    tab === t ? 'bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30' : 'bg-white/5 border-white/10 text-[#B3B3B3]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        ) : shown.length === 0 ? (
          <div className="text-center py-12 text-[#B3B3B3]">
            <CalendarX2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {tab === 'requests' && 'No pending booking requests.'}
              {tab === 'upcoming' && 'No upcoming bookings.'}
              {tab === 'past'     && 'No past booking history.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map(b => {
              const musician  = b.musicians
              const name      = musician?.stage_name ?? 'Unknown Artist'
              const location  = [musician?.city, musician?.state].filter(Boolean).join(', ')
              const rate      = b.agreed_rate ?? b.offered_rate
              const actingAccept  = acting === b.id + ':accepted'
              const actingDecline = acting === b.id + ':declined'

              return (
                <div
                  key={b.id}
                  className="bg-[#121212] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-6 h-6 bg-[#1DB954]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Music2 className="w-3 h-3 text-[#1DB954]" />
                        </div>
                        <h3 className="text-white font-bold text-sm">{name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </div>
                      {location && (
                        <div className="flex items-center gap-1 mt-1 text-[#B3B3B3] text-xs ml-8">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {location}
                        </div>
                      )}
                      {musician?.genre && musician.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 ml-8">
                          {musician.genre.slice(0, 2).map(g => (
                            <span key={g} className="text-[9px] font-space-mono uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#1DB954]/10 text-[#1DB954]">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[#1DB954] font-bold text-sm flex-shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                      {rate}/hr
                    </div>
                  </div>

                  {/* Date / time row */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#B3B3B3]">
                    <div className="flex items-center gap-1">
                      <CalendarX2 className="w-3 h-3 text-[#1DB954]" />
                      {fmtDate(b.event_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#1DB954]" />
                      {fmt12(b.start_time)} – {fmt12(b.end_time)}
                    </div>
                    {b.set_length_minutes && (
                      <span className="text-[#B3B3B3]/60">{b.set_length_minutes}min set</span>
                    )}
                  </div>

                  {/* Message */}
                  {b.message && (
                    <div className="mt-3 bg-[#1A1A1A] rounded-lg p-3 border border-white/5">
                      <p className="text-xs text-[#B3B3B3] font-medium mb-1">Message from artist</p>
                      <p className="text-sm text-white/80 leading-relaxed">{b.message}</p>
                    </div>
                  )}

                  {/* Accept / Decline for pending */}
                  {b.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => updateStatus(b.id, 'accepted')}
                        disabled={!!acting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/30 text-[#1DB954] font-semibold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actingAccept ? 'Accepting…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'declined')}
                        disabled={!!acting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        <XCircle className="w-4 h-4" />
                        {actingDecline ? 'Declining…' : 'Decline'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
