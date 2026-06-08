import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

const VALID_STATUSES = new Set<BookingStatus>(['pending', 'accepted', 'declined', 'cancelled', 'completed'])

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending:   ['accepted', 'declined', 'cancelled'],
  accepted:  ['cancelled', 'completed'],
  declined:  [],
  cancelled: [],
  completed: [],
}

const MAX_NOTES_LENGTH = 1000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const bookingId = req.query.id as string
  const { status, venue_notes } = req.body

  if (!status) return res.status(400).json({ error: 'Missing status' })
  if (!VALID_STATUSES.has(status as BookingStatus)) {
    return res.status(400).json({ error: 'Invalid status value' })
  }
  if (venue_notes !== undefined && typeof venue_notes !== 'string') {
    return res.status(400).json({ error: 'venue_notes must be a string' })
  }
  if (typeof venue_notes === 'string' && venue_notes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: `venue_notes exceeds ${MAX_NOTES_LENGTH} characters` })
  }

  try {
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, musicians(stage_name), venues(name)')
      .eq('id', bookingId)
      .single()

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    if (booking.musician_id !== user.id && booking.venue_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const allowed = VALID_TRANSITIONS[booking.status as BookingStatus] ?? []
    if (!allowed.includes(status as BookingStatus)) {
      return res.status(400).json({
        error: `Cannot transition from '${booking.status}' to '${status}'`,
      })
    }

    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
    if (status === 'accepted') patch.agreed_rate = booking.offered_rate
    if (venue_notes !== undefined) patch.venue_notes = venue_notes

    const { data: updated, error } = await supabaseAdmin
      .from('bookings')
      .update(patch)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    const dateStr = new Date(booking.event_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    const venueName    = (booking.venues as { name: string } | null)?.name ?? 'the venue'
    const musicianName = (booking.musicians as { stage_name: string } | null)?.stage_name ?? 'the musician'

    if (status === 'accepted') {
      await supabaseAdmin.from('notifications').insert({
        user_id: booking.musician_id,
        type: 'booking_accepted',
        message: `Your booking at ${venueName} on ${dateStr} was accepted! 🎉`,
        link: '/dashboard?tab=upcoming',
      })
    } else if (status === 'declined') {
      await supabaseAdmin.from('notifications').insert({
        user_id: booking.musician_id,
        type: 'booking_declined',
        message: `Your booking request at ${venueName} on ${dateStr} was declined.`,
        link: '/dashboard?tab=declined',
      })
    } else if (status === 'cancelled') {
      const notifyId      = user.id === booking.musician_id ? booking.venue_id : booking.musician_id
      const cancellerName = user.id === booking.musician_id ? musicianName : venueName
      await supabaseAdmin.from('notifications').insert({
        user_id: notifyId,
        type: 'booking_cancelled',
        message: `Booking for ${dateStr} was cancelled by ${cancellerName}.`,
        link: '/dashboard',
      })
    }

    return res.status(200).json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return res.status(500).json({ error: message })
  }
}
