import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { FeedData } from '@/components/feed/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

const M_COLS = 'id,stage_name,bio,genre,city,state,hourly_rate,spotify_url,youtube_url,profile_image,is_available,created_at'
const V_COLS = 'id,name,bio,city,state,capacity,profile_image,created_at'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const city = typeof req.query.city === 'string' ? req.query.city : ''

  const [mAll, mNear, mMedia, vAll, vNear] = await Promise.all([
    supabase.from('musicians').select(M_COLS).order('created_at', { ascending: false }).limit(20),
    city
      ? supabase.from('musicians').select(M_COLS).ilike('city', city).order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
    supabase.from('musicians').select(M_COLS).or('spotify_url.not.is.null,youtube_url.not.is.null').order('created_at', { ascending: false }).limit(10),
    supabase.from('venues').select(V_COLS).order('created_at', { ascending: false }).limit(20),
    city
      ? supabase.from('venues').select(V_COLS).ilike('city', city).order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ])

  const allMusicians = mAll.data ?? []
  const allVenues = vAll.data ?? []

  // Featured: profiles with both name + bio
  const featuredMusicians = [...allMusicians.filter(m => m.stage_name && m.bio)].slice(0, 5)
  const featuredVenues = [...allVenues.filter(v => v.name && v.bio)].slice(0, 5)

  const response: FeedData = {
    featured: {
      musicians: featuredMusicians.length >= 2 ? featuredMusicians : allMusicians.slice(0, 5),
      venues: featuredVenues.length >= 2 ? featuredVenues : allVenues.slice(0, 5),
    },
    musicians: {
      all: allMusicians.slice(0, 10),
      nearYou: (mNear.data ?? []).slice(0, 10),
      withMedia: (mMedia.data ?? []).slice(0, 10),
      trending: allMusicians.slice(0, 6),
    },
    venues: {
      all: allVenues.slice(0, 10),
      nearYou: (vNear.data ?? []).slice(0, 10),
      trending: allVenues.slice(0, 6),
    },
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.status(200).json(response)
}
