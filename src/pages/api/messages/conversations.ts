import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    try {
      const { data: convs, error: convErr } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (convErr) return res.status(500).json({ error: convErr.message })
      if (!convs?.length) return res.json([])

      const otherIds = convs.map(c =>
        c.participant_one_id === user.id ? c.participant_two_id : c.participant_one_id
      )
      const uniqueOtherIds = [...new Set(otherIds)]
      const conversationIds = convs.map(c => c.id)

      // 3 parallel queries instead of N×3 sequential queries
      const [musiciansResult, venuesResult, unreadResult] = await Promise.all([
        supabaseAdmin.from('musicians').select('id, stage_name').in('id', uniqueOtherIds),
        supabaseAdmin.from('venues').select('id, name').in('id', uniqueOtherIds),
        supabaseAdmin
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .eq('read', false),
      ])

      const musicianMap = new Map(
        (musiciansResult.data ?? []).map(m => [m.id, { name: m.stage_name as string, role: 'musician' }])
      )
      const venueMap = new Map(
        (venuesResult.data ?? []).map(v => [v.id, { name: v.name as string, role: 'venue' }])
      )
      const unreadByConv = new Map<string, number>()
      for (const msg of unreadResult.data ?? []) {
        unreadByConv.set(msg.conversation_id, (unreadByConv.get(msg.conversation_id) ?? 0) + 1)
      }

      const enriched = convs.map(conv => {
        const otherId = conv.participant_one_id === user.id ? conv.participant_two_id : conv.participant_one_id
        const participant = musicianMap.get(otherId) ?? venueMap.get(otherId) ?? { name: 'User', role: '' }
        return {
          ...conv,
          other_participant: { id: otherId, ...participant },
          unread_count: unreadByConv.get(conv.id) ?? 0,
        }
      })

      return res.json(enriched)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { other_user_id } = req.body as { other_user_id?: string }

      if (!other_user_id || !UUID_RE.test(other_user_id)) {
        return res.status(400).json({ error: 'Invalid other_user_id' })
      }
      if (other_user_id === user.id) {
        return res.status(400).json({ error: 'Cannot message yourself' })
      }

      // Sort IDs so the unique constraint is order-independent
      const [p1, p2] = [user.id, other_user_id].sort()

      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('participant_one_id', p1)
        .eq('participant_two_id', p2)
        .maybeSingle()

      if (existing) return res.json({ id: existing.id })

      const { data: created, error } = await supabaseAdmin
        .from('conversations')
        .insert({ participant_one_id: p1, participant_two_id: p2 })
        .select('id')
        .single()

      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ id: created.id })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      return res.status(500).json({ error: message })
    }
  }

  return res.status(405).end()
}
