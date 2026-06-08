import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

const TIME_RE = /^\d{2}:\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_MESSAGE_LENGTH = 2000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { venue_id, event_date, start_time, end_time, set_length_minutes, offered_rate, message } = req.body

    if (!venue_id || !event_date || !start_time || !end_time || !offered_rate || !message?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (!DATE_RE.test(event_date)) {
      return res.status(400).json({ error: 'Invalid event_date format' })
    }
    if (!TIME_RE.test(start_time) || !TIME_RE.test(end_time)) {
      return res.status(400).json({ error: 'Invalid time format' })
    }

    const today = new Date().toISOString().split('T')[0]
    if (event_date < today) {
      return res.status(400).json({ error: 'Event date must be today or in the future' })
    }
    if (end_time <= start_time) {
      return res.status(400).json({ error: 'End time must be after start time' })
    }

    const rateNum = Number(offered_rate)
    if (!Number.isFinite(rateNum) || rateNum <= 0) {
      return res.status(400).json({ error: 'offered_rate must be a positive number' })
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters` })
    }
    if (set_length_minutes !== undefined && set_length_minutes !== null) {
      const mins = Number(set_length_minutes)
      if (!Number.isInteger(mins) || mins <= 0) {
        return res.status(400).json({ error: 'set_length_minutes must be a positive integer' })
      }
    }

    const { data: musician } = await supabaseAdmin
      .from('musicians')
      .select('id, stage_name')
      .eq('id', user.id)
      .single()

    if (!musician) return res.status(403).json({ error: 'Only musicians can request bookings' })

    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, name')
      .eq('id', venue_id)
      .single()

    if (!venue) return res.status(404).json({ error: 'Venue not found' })

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        musician_id: musician.id,
        venue_id,
        requester_id: user.id,
        status: 'pending',
        event_date,
        start_time,
        end_time,
        set_length_minutes: set_length_minutes ? Number(set_length_minutes) : null,
        offered_rate: rateNum,
        message: message.trim(),
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    const dateStr = new Date(event_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    await supabaseAdmin.from('notifications').insert({
      user_id: venue_id,
      type: 'booking_request',
      message: `New booking request from ${musician.stage_name ?? 'a musician'} for ${dateStr}`,
      link: '/dashboard?tab=requests',
    })

    return res.status(201).json(booking)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return res.status(500).json({ error: message })
  }
}
