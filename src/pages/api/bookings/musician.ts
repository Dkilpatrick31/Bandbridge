import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, venues(name, city, state)')
      .eq('musician_id', user.id)
      .order('event_date', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return res.status(500).json({ error: message })
  }
}
