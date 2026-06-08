import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/apiAuth'

// Guard: set SEED_DEMO_SECRET in your environment to a long random string.
// Leaving it unset disables the endpoint entirely (returns 401).
const SEED_SECRET = process.env.SEED_DEMO_SECRET ?? ''

function demoEmail(slug: string) {
  return `demo.${slug}@bandbridge.demo`
}

async function ensureAuthUserId(email: string, role: string): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: randomUUID(),
    user_metadata: { role, first_name: 'Demo', last_name: 'Account' },
  })
  if (data?.user) return data.user.id

  // Email already registered — locate via listUsers
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = list?.users?.find(u => u.email === email)
  if (found) return found.id
  throw new Error(`Cannot resolve user for ${email}: ${error?.message}`)
}

const MUSICIANS = [
  {
    slug: 'neon-velvet',
    stage_name: 'Neon Velvet',
    bio: "Austin's foremost synthwave producer — layered pads, rolling basslines, and a Friday residency at Stubb's that keeps the crowd moving until last call.",
    genre: ['EDM'],
    city: 'Austin', state: 'TX',
    hourly_rate: 350,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'lone-star-collective',
    stage_name: 'The Lone Star Collective',
    bio: 'Six-piece country outfit with three-part harmonies and outlaw spirit. Born on 6th Street, they play everything from Townes Van Zandt to original material.',
    genre: ['Country'],
    city: 'Austin', state: 'TX',
    hourly_rate: 275,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'marcus-reel',
    stage_name: 'Marcus Reel',
    bio: 'Upright bassist and composer with a regular chair at the Elephant Room. Blends hard bop and modern jazz — available for private events and recording sessions.',
    genre: ['Jazz'],
    city: 'Austin', state: 'TX',
    hourly_rate: 200,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'solara',
    stage_name: 'SOLARA',
    bio: 'Neo-soul vocalist drawing from Erykah Badu, Lauryn Hill, and Frank Ocean. Studio work and live bookings — her voice will stop the room.',
    genre: ['R&B'],
    city: 'Austin', state: 'TX',
    hourly_rate: 425,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'dustin-hale-band',
    stage_name: 'Dustin Hale Band',
    bio: 'Traditional Texas blues with a modern edge. 15 years on the circuit, from honky-tonks to corporate events — available most weekends.',
    genre: ['Blues'],
    city: 'Austin', state: 'TX',
    hourly_rate: 180,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'crux',
    stage_name: 'Crux',
    bio: 'Four-piece rock band — think Foo Fighters meets Arctic Monkeys. Known for a relentlessly high-energy live show that leaves stages ringing.',
    genre: ['Rock'],
    city: 'Austin', state: 'TX',
    hourly_rate: 300,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'dj-phantom',
    stage_name: 'DJ Phantom',
    bio: 'Hip-hop DJ and producer with 10 years across corporate events, weddings, and club nights. Known for seamless transitions and accurate crowd reads.',
    genre: ['Hip-Hop'],
    city: 'Austin', state: 'TX',
    hourly_rate: 250,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
  {
    slug: 'luna-reyes',
    stage_name: 'Luna Reyes',
    bio: 'Flamenco and Latin jazz fusion — available for restaurant residencies, private events, and cultural festivals. Her guitar and vocals are equally stunning.',
    genre: ['Latin'],
    city: 'Austin', state: 'TX',
    hourly_rate: 220,
    is_available: true,
    spotify_url: null, youtube_url: null,
  },
]

const VENUES = [
  {
    slug: 'velvet-underground-atx',
    name: 'The Velvet Underground ATX',
    bio: 'Intimate dark venue on Red River Street with a capacity of 300. The go-to for indie, jazz, and electronic acts — full bar, green room, and an atmosphere that feels like a secret.',
    city: 'Austin', state: 'TX',
    capacity: 300,
  },
  {
    slug: 'lone-star-amphitheater',
    name: 'Lone Star Amphitheater',
    bio: 'Outdoor amphitheater off South Congress hosting 200+ events a year. Seats 2,500 with a full production team on site and a sunset view that makes every show feel like a festival.',
    city: 'Austin', state: 'TX',
    capacity: 2500,
  },
  {
    slug: 'parish-atx',
    name: 'Parish ATX',
    bio: 'Historic venue on 6th Street, synonymous with rock, blues, and soul. A legendary sound system and intimate 500-person room make every show sound like a studio session.',
    city: 'Austin', state: 'TX',
    capacity: 500,
  },
  {
    slug: 'cheer-up-charlies',
    name: "Cheer Up Charlies",
    bio: "Beloved outdoor patio venue with a 400-person capacity. LGBTQ+ friendly, eclectic booking across every genre — a true Austin institution that champions independent artists.",
    city: 'Austin', state: 'TX',
    capacity: 400,
  },
  {
    slug: 'antones-nightclub',
    name: "Antone's Nightclub",
    bio: "Austin's home of the blues since 1975. Six hundred people packed around an iconic stage, world-class talent, and the kind of unforgettable nights that built Austin's reputation.",
    city: 'Austin', state: 'TX',
    capacity: 600,
  },
]

type SeedResult = { name: string; status: 'created' | 'exists' | 'error'; error?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SEED_SECRET || req.query.secret !== SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const musicians: SeedResult[] = []
  const venues: SeedResult[] = []

  for (const { slug, ...m } of MUSICIANS) {
    try {
      const { data: existing } = await supabaseAdmin
        .from('musicians')
        .select('id')
        .eq('stage_name', m.stage_name)
        .maybeSingle()

      if (existing) {
        musicians.push({ name: m.stage_name, status: 'exists' })
        continue
      }

      const userId = await ensureAuthUserId(demoEmail(slug), 'musician')
      const { error } = await supabaseAdmin.from('musicians').insert({ id: userId, ...m })
      if (error) throw error
      musicians.push({ name: m.stage_name, status: 'created' })
    } catch (e: unknown) {
      musicians.push({ name: m.stage_name, status: 'error', error: (e as Error).message })
    }
  }

  for (const { slug, ...v } of VENUES) {
    try {
      const { data: existing } = await supabaseAdmin
        .from('venues')
        .select('id')
        .eq('name', v.name)
        .maybeSingle()

      if (existing) {
        venues.push({ name: v.name, status: 'exists' })
        continue
      }

      const userId = await ensureAuthUserId(demoEmail(slug), 'venue')
      const { error } = await supabaseAdmin.from('venues').insert({ id: userId, ...v })
      if (error) throw error
      venues.push({ name: v.name, status: 'created' })
    } catch (e: unknown) {
      venues.push({ name: v.name, status: 'error', error: (e as Error).message })
    }
  }

  const hasErrors = [...musicians, ...venues].some(r => r.status === 'error')
  res.status(hasErrors ? 207 : 200).json({ musicians, venues })
}
