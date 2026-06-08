import { useState, useEffect, useCallback } from 'react'
import { CalendarX2, MapPin, Clock, DollarSign, XCircle, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

interface MusicianBooking {
  id: string
  venue_id: string
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
  venues: { name: string; city: string | null; state: string | null } | null
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-amber-500/15  text-amber-400  border-amber-500/30',
  accepted:  'bg-green-500/15  text-green-400  border-green-500/30',
  declined:  'bg-red-500/15    text-red-400    border-red-500/30',
  cancelled: 'bg-gray-500/15   text-gray-400   border-gray-500/30',
  completed: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  accepted:  'Accepted',
  declined:  'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
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

export default function MusicianBookingsPanel({ initialTab }: Props) {
  const [bookings, setBookings]   = useState<MusicianBooking[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)

  const TABS = ['pending', 'upcoming', 'past', 'declined'] as const
  type Tab = typeof TABS[number]
  const [tab, setTab] = useState<Tab>(() => {
    if (initialTab && TABS.includes(initialTab as Tab)) return initialTab as Tab
    return 'pending'
  })

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bookings/musician', {
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

  async function cancelBooking(id: string) {
    setCancelling(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to cancel booking')
        return
      }
      await fetchBookings()
    } catch {
      setError('Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  // Group bookings
  const grouped = {
    pending:  bookings.filter(b => b.status === 'pending'),
    upcoming: bookings.filter(b => b.status === 'accepted' && b.event_date >= todayStr),
    past:     bookings.filter(b => b.status === 'completed' || (b.status === 'accepted' && b.event_date < todayStr)),
    declined: bookings.filter(b => b.status === 'declined' || b.status === 'cancelled'),
  }

  const TAB_LABELS: Record<Tab, string> = {
    pending:  'Pending',
    upcoming: 'Upcoming',
    past:     'Past',
    declined: 'Declined',
  }

  const shown = grouped[tab]

  return (
    <div className="mt-6 bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
      {/* Header + tabs */}
      <div className="px-6 pt-6 pb-0 border-b border-white/5">
        <h2 className="text-white font-bold text-lg mb-4">My Bookings</h2>
        <div className="flex gap-1 -mx-1">
          {TABS.map(t => {
            const count = grouped[t].length
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors relative min-h-[44px] ${
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
              {tab === 'pending'  && 'No pending booking requests.'}
              {tab === 'upcoming' && "No upcoming bookings. Browse venues to find your next gig!"}
              {tab === 'past'     && 'No past bookings yet.'}
              {tab === 'declined' && 'No declined or cancelled bookings.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(b => {
              const venueName = b.venues?.name ?? 'Unknown Venue'
              const location  = [b.venues?.city, b.venues?.state].filter(Boolean).join(', ')
              const rate = b.agreed_rate ?? b.offered_rate
              return (
                <div
                  key={b.id}
                  className="bg-[#121212] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold text-sm truncate">{venueName}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </div>
                      {location && (
                        <div className="flex items-center gap-1 mt-1 text-[#B3B3B3] text-xs">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {location}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-[#1DB954] text-sm font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {rate}/hr
                      </div>
                    </div>
                  </div>

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

                  {b.venue_notes && (
                    <p className="mt-3 text-xs text-[#B3B3B3] italic border-l-2 border-[#1DB954]/30 pl-3">
                      {b.venue_notes}
                    </p>
                  )}

                  {/* Actions */}
                  {b.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancelling === b.id}
                      className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 min-h-[36px]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancelling === b.id ? 'Cancelling…' : 'Cancel Request'}
                    </button>
                  )}

                  {(b.status === 'completed' || (b.status === 'accepted' && b.event_date < todayStr)) && (
                    <button
                      disabled
                      className="mt-3 flex items-center gap-1.5 text-xs text-[#B3B3B3]/40 border border-white/5 px-3 py-1.5 rounded-lg cursor-not-allowed min-h-[36px]"
                      title="Reviews coming soon"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Leave a Review <span className="ml-1 text-[10px]">(coming soon)</span>
                    </button>
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
