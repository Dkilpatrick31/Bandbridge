import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

async function assertParticipant(conversationId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`)
    .maybeSingle()
  return data
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { conversationId } = req.query as { conversationId: string }

  if (req.method === 'GET') {
    const conv = await assertParticipant(conversationId, user.id)
    if (!conv) return res.status(403).json({ error: 'Not found' })

    const { data: msgs, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.json(msgs)
  }

  if (req.method === 'POST') {
    const { content } = req.body as { content?: string }
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' })

    const conv = await assertParticipant(conversationId, user.id)
    if (!conv) return res.status(403).json({ error: 'Not found' })

    const { data: msg, error } = await supabaseAdmin
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    await supabaseAdmin
      .from('conversations')
      .update({ last_message_text: content.trim(), last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return res.status(201).json(msg)
  }

  return res.status(405).end()
}
