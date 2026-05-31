import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, musicians(stage_name, city, state, genre, hourly_rate)')
    .eq('venue_id', user.id)
    .order('event_date', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json(data ?? [])
}
