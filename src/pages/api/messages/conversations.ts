import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin, getApiUser } from '@/lib/apiAuth'

async function getOtherParticipantName(otherId: string): Promise<{ name: string; role: string }> {
  const { data: { user: otherUser } } = await supabaseAdmin.auth.admin.getUserById(otherId)
  const role: string = (otherUser?.user_metadata?.role as string) ?? ''

  if (role === 'musician') {
    const { data } = await supabaseAdmin.from('musicians').select('stage_name').eq('id', otherId).single()
    if (data?.stage_name) return { name: data.stage_name, role }
  } else if (role === 'venue') {
    const { data } = await supabaseAdmin.from('venues').select('name').eq('id', otherId).single()
    if (data?.name) return { name: data.name, role }
  }

  const first = (otherUser?.user_metadata?.first_name as string) ?? ''
  const last = (otherUser?.user_metadata?.last_name as string) ?? ''
  return { name: `${first} ${last}`.trim() || 'User', role }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getApiUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { data: convs, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) return res.status(500).json({ error: error.message })

    const enriched = await Promise.all(
      (convs ?? []).map(async (conv) => {
        const otherId =
          conv.participant_one_id === user.id ? conv.participant_two_id : conv.participant_one_id

        const [participant, { count }] = await Promise.all([
          getOtherParticipantName(otherId),
          supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .eq('read', false),
        ])

        return {
          ...conv,
          other_participant: { id: otherId, ...participant },
          unread_count: count ?? 0,
        }
      })
    )

    return res.json(enriched)
  }

  if (req.method === 'POST') {
    const { other_user_id } = req.body as { other_user_id?: string }
    if (!other_user_id || other_user_id === user.id) {
      return res.status(400).json({ error: 'Invalid other_user_id' })
    }

    // Sort IDs so the unique constraint covers both orderings
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
  }

  return res.status(405).end()
}
