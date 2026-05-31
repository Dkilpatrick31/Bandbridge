import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Admin client — service role bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-role-key'
)

// Anon client — used only to verify the incoming session token
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify session from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const userId = user.id
  const role = user.user_metadata?.role as string | undefined

  try {
    // Delete profile row from the appropriate table
    if (role === 'venue') {
      await supabaseAdmin.from('venues').delete().eq('id', userId)
    } else if (role === 'host') {
      await supabaseAdmin.from('event_hosts').delete().eq('id', userId)
    } else {
      // Default: musician, or fall back to trying all tables
      await supabaseAdmin.from('musicians').delete().eq('id', userId)
      // Silently clean up other tables in case of stale rows
      await supabaseAdmin.from('venues').delete().eq('id', userId)
      await supabaseAdmin.from('event_hosts').delete().eq('id', userId)
    }

    // Delete the auth user — requires service role
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
