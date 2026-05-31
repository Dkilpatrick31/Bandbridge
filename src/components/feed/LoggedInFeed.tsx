import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, ReactNode } from 'react'
import { Music2, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import HeroPanel from './HeroPanel'
import { MusicianCard, VenueCard, FeedCardSkeleton } from './FeedCard'
import {
  GENRE_LABELS, GENRE_COLORS, normalizeGenre,
  type FeedMusician, type FeedVenue, type FeedData, type HeroProfile,
} from './types'
import {
  DEMO_MUSICIANS, DEMO_VENUES, DEMO_MUSICIANS_WITH_MEDIA,
} from './demoData'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fallback<T>(real: T[], demo: T[]): T[] {
  return real.length > 0 ? real : demo
}

function filterM(items: FeedMusician[], genre: string): FeedMusician[] {
  if (genre === 'all') return items
  return items.filter(m => m.genre?.some(g => normalizeGenre(g) === genre))
}

function toHeroMusician(m: FeedMusician): HeroProfile {
  return { id: m.id, name: m.stage_name ?? 'Artist', bio: m.bio, genre: m.genre, city: m.city, state: m.state, type: 'musician', profile_image: m.profile_image, is_available: m.is_available, hourly_rate: m.hourly_rate }
}

function toHeroVenue(v: FeedVenue): HeroProfile {
  return { id: v.id, name: v.name ?? 'Venue', bio: v.bio, genre: null, city: v.city, state: v.state, type: 'venue', profile_image: v.profile_image }
}

// ─── Genre filter ─────────────────────────────────────────────────────────────
function GenreFilter({ selected, onSelect }: { selected: string; onSelect: (g: string) => void }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  return (
    <div style={{ overflow: 'visible' }} className="mb-6 py-2">
      <div className="genre-pill-row scrollbar-hide">
        {GENRE_LABELS.map(label => {
          const key = normalizeGenre(label)
          const active = selected === key
          // Don't apply hover styling to the already-active pill — it has its own glow.
          const hovered = !active && hoveredKey === key
          const color = GENRE_COLORS[key] ?? '#1DB954'
          return (
            <button
              key={label}
              onClick={() => onSelect(key)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`genre-pill flex-shrink-0 px-4 py-2 rounded-full text-xs border ${active ? 'genre-pill-active' : ''}`}
              style={{
                ['--pill-glow' as string]: `${color}70`,
                backgroundColor: active ? `${color}22` : hovered ? `${color}15` : '#1A1A1A',
                borderColor:      active ? color       : hovered ? `${color}90` : '#2A2A2A',
                color:            active ? color       : hovered ? `${color}CC` : '#A0A0A0',
                // Hover glow is the same layers as .genre-pill-active but at ~60% opacity.
                boxShadow: hovered ? `0 0 18px -4px ${color}50, 0 0 0 1px ${color}30` : undefined,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Content row ──────────────────────────────────────────────────────────────
interface ContentRowProps {
  title: string
  seeAllHref: string
  loading: boolean
  children?: ReactNode
  empty?: boolean
  emptyIcon?: ReactNode
  emptyMessage?: string
  emptyCTA?: { label: string; href: string }
}

function ContentRow({ title, seeAllHref, loading, children, empty, emptyIcon, emptyMessage, emptyCTA }: ContentRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-playfair font-bold text-[#F0F0F0] text-xl sm:text-2xl">{title}</h2>
        <Link href={seeAllHref} className="text-[#A0A0A0] hover:text-[#F0F0F0] text-sm transition-colors ml-4 flex-shrink-0">
          See All →
        </Link>
      </div>

      {loading ? (
        <div className="feed-row scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => <FeedCardSkeleton key={i} />)}
        </div>
      ) : empty ? (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
          {emptyIcon && <div className="flex justify-center mb-3 opacity-20">{emptyIcon}</div>}
          <p className="text-[#A0A0A0] text-sm mb-4">{emptyMessage ?? 'Nothing here yet.'}</p>
          {emptyCTA && (
            <Link href={emptyCTA.href} className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 text-black" style={{ backgroundColor: '#1DB954' }}>
              {emptyCTA.label}
            </Link>
          )}
        </div>
      ) : (
        <div className="feed-row scrollbar-hide">{children}</div>
      )}
    </div>
  )
}

// ─── Shared layout ────────────────────────────────────────────────────────────
interface FeedLayoutProps {
  greeting: string
  tagline: string
  loading: boolean
  heroProfiles: HeroProfile[]
  role: string | undefined
  selectedGenre: string
  onGenreSelect: (g: string) => void
  children: ReactNode
}

function FeedLayout({ greeting, tagline, loading, heroProfiles, role, selectedGenre, onGenreSelect, children }: FeedLayoutProps) {
  // Find which hero profile best matches the active genre filter so the panel
  // jumps there on a single pill click.
  const heroStartIdx = selectedGenre === 'all' ? 0 : (() => {
    const i = heroProfiles.findIndex(p =>
      p.genre?.some(g => normalizeGenre(g) === selectedGenre)
    )
    return i >= 0 ? i : 0
  })()

  return (
    <>
      <Head><title>Discover | BandBridge</title></Head>
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#0D0D0D', paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="pt-6 pb-5">
            <h1 className="font-playfair font-black text-2xl sm:text-3xl text-[#F0F0F0]">{greeting}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1 font-space-mono">{tagline}</p>
          </div>

          {/* Hero */}
          {loading ? (
            <div className="skeleton-shimmer rounded-2xl mb-8" style={{ height: 'min(70vh, 580px)', minHeight: '380px' }} />
          ) : heroProfiles.length > 0 ? (
            <div className="mb-8">
              <HeroPanel profiles={heroProfiles} role={role} startIdx={heroStartIdx} />
            </div>
          ) : null}

          {/* Genre filter — parent has overflow:visible so rotation is never clipped */}
          <GenreFilter selected={selectedGenre} onSelect={onGenreSelect} />

          <div className="space-y-12">{children}</div>
        </div>
      </div>
    </>
  )
}

// ─── Main feed ────────────────────────────────────────────────────────────────
export default function LoggedInFeed() {
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role as 'musician' | 'venue' | 'host' | undefined
  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [userCity, setUserCity] = useState('')

  // Fetch the user's city from their profile for "Near You" rows
  useEffect(() => {
    if (!user || !userRole) return
    const table = userRole === 'musician' ? 'musicians' : userRole === 'venue' ? 'venues' : 'event_hosts'
    supabase.from(table as 'musicians').select('city').eq('id', user.id).single().then(({ data }) => {
      if (data?.city) setUserCity(data.city)
    })
  }, [user, userRole])

  // Fetch feed — only re-fetches when city changes; genre is filtered client-side
  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams({ city: userCity })
    setLoading(true)
    fetch(`/api/feed?${params}`)
      .then(r => r.json())
      .then((d: FeedData) => { setFeedData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, userCity])

  // ── Merge API data with demo fallbacks ──────────────────────────────────────
  const data = {
    featured: {
      musicians: fallback(feedData?.featured.musicians ?? [], DEMO_MUSICIANS.filter(m => m.bio).slice(0, 5)),
      venues:    fallback(feedData?.featured.venues ?? [],    DEMO_VENUES),
    },
    musicians: {
      all:      fallback(feedData?.musicians.all ?? [],      DEMO_MUSICIANS),
      nearYou:  fallback(feedData?.musicians.nearYou ?? [],  DEMO_MUSICIANS),
      withMedia: fallback(feedData?.musicians.withMedia ?? [], DEMO_MUSICIANS_WITH_MEDIA),
      trending: fallback(feedData?.musicians.trending ?? [], DEMO_MUSICIANS.slice(0, 6)),
    },
    venues: {
      all:      fallback(feedData?.venues.all ?? [],      DEMO_VENUES),
      nearYou:  fallback(feedData?.venues.nearYou ?? [],  DEMO_VENUES),
      trending: fallback(feedData?.venues.trending ?? [], DEMO_VENUES),
    },
  }

  // ── Hero profiles — role-aware ──────────────────────────────────────────────
  const heroProfiles: HeroProfile[] = (() => {
    if (userRole === 'musician') return data.featured.venues.map(toHeroVenue)
    if (userRole === 'venue')    return data.featured.musicians.map(toHeroMusician)
    // host: interleave musicians and venues
    const m = data.featured.musicians.map(toHeroMusician)
    const v = data.featured.venues.map(toHeroVenue)
    return Array.from({ length: 5 }, (_, i) => (i % 2 === 0 ? m[Math.floor(i / 2)] : v[Math.floor(i / 2)])).filter(Boolean) as HeroProfile[]
  })()

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const greeting = firstName ? `${timeGreeting}, ${firstName}` : timeGreeting
  const tagline = userRole === 'musician' ? '// your stage is waiting' : userRole === 'venue' ? '// find your next artist' : '// discover the perfect sound'

  // ── MUSICIAN ROWS ──────────────────────────────────────────────────────────
  if (userRole === 'musician') {
    const nearVenues   = data.venues.nearYou
    const allVenues    = data.venues.all
    const trendVenues  = data.venues.trending
    const musicMedia   = filterM(data.musicians.withMedia, selectedGenre)

    return (
      <FeedLayout greeting={greeting} tagline={tagline} loading={loading} heroProfiles={heroProfiles} role={userRole} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
        <ContentRow title="Venues Near You" seeAllHref="/venues" loading={loading}
          empty={nearVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage={userCity ? `No venues in ${userCity} yet.` : 'No venues nearby.'}
        >
          {nearVenues.map(v => <VenueCard key={v.id} venue={v} />)}
        </ContentRow>

        <ContentRow title="Currently Booking" seeAllHref="/venues" loading={loading}
          empty={allVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage="No venues listed yet."
          emptyCTA={{ label: 'Browse All Venues', href: '/venues' }}
        >
          {allVenues.map(v => <VenueCard key={v.id} venue={v} bookingBadge />)}
        </ContentRow>

        <ContentRow title="Trending Venues This Week" seeAllHref="/venues" loading={loading}
          empty={trendVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage="Check back soon."
        >
          {trendVenues.map(v => <VenueCard key={v.id} venue={v} trending />)}
        </ContentRow>

        <ContentRow title="New Music / Latest Releases" seeAllHref="/musicians" loading={loading}
          empty={musicMedia.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="Artists can add Spotify and YouTube links from their dashboard."
        >
          {musicMedia.map(m => <MusicianCard key={m.id} musician={m} mediaMode />)}
        </ContentRow>

        <ContentRow title="Explore More Venues" seeAllHref="/venues" loading={loading}
          empty={allVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage="No venues yet."
          emptyCTA={{ label: 'List Your Venue', href: '/signup' }}
        >
          {allVenues.map(v => <VenueCard key={v.id} venue={v} />)}
        </ContentRow>
      </FeedLayout>
    )
  }

  // ── VENUE ROWS ─────────────────────────────────────────────────────────────
  if (userRole === 'venue') {
    const nearM    = filterM(data.musicians.nearYou,  selectedGenre)
    const allM     = filterM(data.musicians.all,      selectedGenre)
    const trendM   = filterM(data.musicians.trending, selectedGenre)
    const withMedia = filterM(data.musicians.withMedia, selectedGenre)

    return (
      <FeedLayout greeting={greeting} tagline={tagline} loading={loading} heroProfiles={heroProfiles} role={userRole} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
        <ContentRow title="Musicians Near You" seeAllHref="/musicians" loading={loading}
          empty={(nearM.length === 0 && allM.length === 0)}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage={userCity ? `No musicians in ${userCity} yet.` : 'No musicians nearby.'}
        >
          {(nearM.length > 0 ? nearM : allM).map(m => <MusicianCard key={m.id} musician={m} />)}
        </ContentRow>

        <ContentRow title="Recently Joined Musicians" seeAllHref="/musicians" loading={loading}
          empty={allM.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="No musicians yet — be the first to get listed!"
          emptyCTA={{ label: 'Get Listed Free', href: '/signup' }}
        >
          {allM.map(m => <MusicianCard key={m.id} musician={m} />)}
        </ContentRow>

        <ContentRow title="Trending Musicians This Week" seeAllHref="/musicians" loading={loading}
          empty={trendM.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="Check back soon for trending artists."
        >
          {trendM.map(m => <MusicianCard key={m.id} musician={m} trending />)}
        </ContentRow>

        <ContentRow title="Top Artists by Genre" seeAllHref="/musicians" loading={loading}
          empty={allM.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="No artists match this genre yet."
        >
          {allM.map(m => <MusicianCard key={m.id} musician={m} />)}
        </ContentRow>

        <ContentRow title="New Music / Latest Releases" seeAllHref="/musicians" loading={loading}
          empty={withMedia.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="Artists can add music links from their dashboard."
        >
          {withMedia.map(m => <MusicianCard key={m.id} musician={m} mediaMode />)}
        </ContentRow>
      </FeedLayout>
    )
  }

  // ── HOST ROWS (default) ────────────────────────────────────────────────────
  const trendM   = filterM(data.musicians.trending, selectedGenre)
  const allVenues = data.venues.all
  const allM     = filterM(data.musicians.all, selectedGenre)
  const trendV   = data.venues.trending
  const withMedia = filterM(data.musicians.withMedia, selectedGenre)

  return (
    <FeedLayout greeting={greeting} tagline={tagline} loading={loading} heroProfiles={heroProfiles} role={userRole} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
      <ContentRow title="Top Musicians This Week" seeAllHref="/musicians" loading={loading}
        empty={trendM.length === 0}
        emptyIcon={<Music2 className="w-10 h-10" />}
        emptyMessage="No musicians yet."
        emptyCTA={{ label: 'Browse Musicians', href: '/musicians' }}
      >
        {trendM.map(m => <MusicianCard key={m.id} musician={m} trending />)}
      </ContentRow>

      <ContentRow title="Available Venues" seeAllHref="/venues" loading={loading}
        empty={allVenues.length === 0}
        emptyIcon={<Building2 className="w-10 h-10" />}
        emptyMessage="No venues listed yet."
      >
        {allVenues.map(v => <VenueCard key={v.id} venue={v} bookingBadge />)}
      </ContentRow>

      <ContentRow title="Recently Joined Musicians" seeAllHref="/musicians" loading={loading}
        empty={allM.length === 0}
        emptyIcon={<Music2 className="w-10 h-10" />}
        emptyMessage="No musicians yet."
        emptyCTA={{ label: 'Get Listed', href: '/signup' }}
      >
        {allM.map(m => <MusicianCard key={m.id} musician={m} />)}
      </ContentRow>

      <ContentRow title="Trending Venues" seeAllHref="/venues" loading={loading}
        empty={trendV.length === 0}
        emptyIcon={<Building2 className="w-10 h-10" />}
        emptyMessage="No trending venues yet."
      >
        {trendV.map(v => <VenueCard key={v.id} venue={v} trending />)}
      </ContentRow>

      <ContentRow title="New Music / Latest Releases" seeAllHref="/musicians" loading={loading}
        empty={withMedia.length === 0}
        emptyIcon={<Music2 className="w-10 h-10" />}
        emptyMessage="Artists can add music links from their dashboard."
      >
        {withMedia.map(m => <MusicianCard key={m.id} musician={m} mediaMode />)}
      </ContentRow>
    </FeedLayout>
  )
}
