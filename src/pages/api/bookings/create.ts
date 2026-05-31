import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { venue_id, event_date, start_time, end_time, set_length_minutes, offered_rate, message } = req.body

  if (!venue_id || !event_date || !start_time || !end_time || !offered_rate || !message?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (Number(offered_rate) <= 0) {
    return res.status(400).json({ error: 'offered_rate must be positive' })
  }

  // Verify the caller is a musician
  const { data: musician } = await supabaseAdmin
    .from('musicians')
    .select('id, stage_name')
    .eq('id', user.id)
    .single()

  if (!musician) return res.status(403).json({ error: 'Only musicians can request bookings' })

  // Verify venue exists
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
      offered_rate: Number(offered_rate),
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
}
