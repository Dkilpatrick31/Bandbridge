import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react'
import { X, Clock, DollarSign, Calendar, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BookingModalProps {
  venueId: string
  venueName: string
  defaultRate?: number
  onClose: () => void
  onSuccess: () => void
}

const SET_LENGTHS = [
  { value: '30',  label: '30 minutes' },
  { value: '45',  label: '45 minutes' },
  { value: '60',  label: '1 hour' },
  { value: '90',  label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '150', label: '2.5 hours' },
  { value: '180', label: '3 hours' },
]

const FIELD = 'w-full bg-[#121212] border border-[#2A2A2A] text-white placeholder-[#B3B3B3]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/60 transition-colors'
const LABEL = 'block text-xs font-medium text-[#B3B3B3] uppercase tracking-wider mb-2'

export default function BookingModal({ venueId, venueName, defaultRate, onClose, onSuccess }: BookingModalProps) {
  const [visible, setVisible]     = useState(false)
  const [date, setDate]           = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [setLength, setSetLength] = useState('')
  const [rate, setRate]           = useState(defaultRate?.toString() ?? '')
  const [message, setMessage]     = useState('')
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Mount animation
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 280)
  }, [onClose])

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [handleClose])

  // Live pay estimate
  const totalPay = useMemo(() => {
    const rateNum = parseFloat(rate)
    if (!rateNum || rateNum <= 0) return null

    if (setLength) return (parseInt(setLength) / 60) * rateNum

    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number)
      const [eh, em] = endTime.split(':').map(Number)
      const mins = eh * 60 + em - (sh * 60 + sm)
      if (mins <= 0) return null
      return (mins / 60) * rateNum
    }
    return null
  }, [rate, setLength, startTime, endTime])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (endTime && startTime && endTime <= startTime) {
      setError('End time must be after start time.')
      return
    }
    if (message.trim().length < 10) {
      setError('Please write a message of at least 10 characters.')
      return
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          venue_id: venueId,
          event_date: date,
          start_time: startTime,
          end_time: endTime,
          set_length_minutes: setLength ? parseInt(setLength) : undefined,
          offered_rate: parseFloat(rate),
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send request.'); return }
      onSuccess()
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 280ms ease' }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-lg bg-[#1A1A1A] rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl z-10 overflow-y-auto max-h-[92dvh]"
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 280ms cubic-bezier(0.34,1.56,0.64,1), opacity 220ms ease',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-black text-xl">Request a Booking</h2>
            <p className="text-[#B3B3B3] text-sm mt-0.5">at <span className="text-[#1DB954] font-medium">{venueName}</span></p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#B3B3B3] hover:text-white p-2 -mr-1 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Event date */}
          <div>
            <label className={LABEL}>
              <Calendar className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              Event Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              required
              className={FIELD}
            />
          </div>

          {/* Time window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>
                <Clock className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                className={FIELD}
              />
            </div>
          </div>

          {/* Set length */}
          <div>
            <label className={LABEL}>Set Length</label>
            <select
              value={setLength}
              onChange={e => setSetLength(e.target.value)}
              className={FIELD + ' appearance-none cursor-pointer'}
            >
              <option value="">— Select —</option>
              {SET_LENGTHS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Rate */}
          <div>
            <label className={LABEL}>
              <DollarSign className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              Your Rate ($ / hr)
            </label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              min="1"
              step="0.01"
              placeholder="350"
              required
              className={FIELD}
            />
          </div>

          {/* Message */}
          <div>
            <label className={LABEL}>
              <MessageSquare className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              Message to Venue
              <span className="text-[#B3B3B3]/50 ml-1 normal-case">(required)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell the venue about yourself and your act. What style do you play? What equipment do you bring?"
              rows={4}
              required
              className={FIELD + ' resize-none'}
            />
          </div>

          {/* Pay summary */}
          {totalPay !== null && totalPay > 0 && (
            <div className="bg-[#0D0D0D] rounded-xl p-4 border border-white/5 space-y-2.5">
              <p className="text-[#B3B3B3] text-xs uppercase tracking-wider font-medium mb-1">Estimated Pay</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#B3B3B3]">
                  {setLength ? `${parseInt(setLength) / 60}h` : ''} × ${parseFloat(rate).toFixed(0)}/hr
                </span>
                <span className="text-white font-medium">${totalPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B3B3B3]">Platform fee (5%)</span>
                <span className="text-red-400">−${(totalPay * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                <span className="text-white font-semibold">You receive</span>
                <span className="text-[#1DB954] font-black text-base">${(totalPay * 0.95).toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all hover:scale-[1.02] text-sm min-h-[52px]"
          >
            {submitting ? 'Sending Request…' : 'Send Booking Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
