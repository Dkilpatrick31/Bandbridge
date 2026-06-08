import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const userId = user.id
  const role = user.user_metadata?.role as string | undefined

  try {
    if (role === 'venue') {
      await supabaseAdmin.from('venues').delete().eq('id', userId)
    } else if (role === 'host') {
      await supabaseAdmin.from('event_hosts').delete().eq('id', userId)
    } else {
      await supabaseAdmin.from('musicians').delete().eq('id', userId)
      await supabaseAdmin.from('venues').delete().eq('id', userId)
      await supabaseAdmin.from('event_hosts').delete().eq('id', userId)
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) {
      return res.status(500).json({ error: deleteError.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return res.status(500).json({ error: message })
  }
}
