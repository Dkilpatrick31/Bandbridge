import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { conversationId } = req.query as { conversationId: string }

  try {
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
      .maybeSingle()

    if (!conv) return res.status(403).json({ error: 'Not found' })

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('read', false)

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return res.status(500).json({ error: message })
  }
}
