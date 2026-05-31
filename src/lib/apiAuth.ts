import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest } from 'next'
import type { User } from '@supabase/supabase-js'

// Server-side admin client — bypasses RLS; access control is enforced manually.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Extracts the bearer token and returns the authenticated user, or null. */
export async function getApiUser(req: NextApiRequest): Promise<User | null> {
  const token = req.headers.authorization?.replace('Bearer ', '').trim()
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user ?? null
}
