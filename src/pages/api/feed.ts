import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

const MUSICIAN_COLS = 'id,stage_name,bio,genre,city,state,hourly_rate,spotify_url,youtube_url,profile_image,is_available,created_at'
const VENUE_COLS = 'id,name,bio,city,state,capacity,profile_image,created_at'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [{ data: musicians }, { data: venues }] = await Promise.all([
    supabase.from('musicians').select(MUSICIAN_COLS).order('created_at', { ascending: false }).limit(20),
    supabase.from('venues').select(VENUE_COLS).order('created_at', { ascending: false }).limit(10),
  ])

  const allMusicians = musicians ?? []
  const allVenues = venues ?? []

  // Featured: musicians with both a stage name and bio (most complete profiles)
  const featured = allMusicians.filter(m => m.stage_name && m.bio).slice(0, 5)

  // If fewer than 2 bios, pad with any musicians
  const featuredFilled = featured.length < 2
    ? [...featured, ...allMusicians.filter(m => !featured.find(f => f.id === m.id))].slice(0, 5)
    : featured

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).json({
    featured: featuredFilled,
    recentMusicians: allMusicians.slice(0, 10),
    recentVenues: allVenues,
    trending: allMusicians.slice(0, 6),
    withMedia: allMusicians.filter(m => m.spotify_url || m.youtube_url).slice(0, 10),
  })
}
