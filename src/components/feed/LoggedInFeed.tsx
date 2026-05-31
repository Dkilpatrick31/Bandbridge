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

// ─── Genre filter ─────────────────────────────────────────────────────────────
function GenreFilter({ selected, onSelect }: { selected: string; onSelect: (g: string) => void }) {
  return (
    <div className="feed-row scrollbar-hide mb-8">
      {GENRE_LABELS.map(label => {
        const key = normalizeGenre(label)
        const active = selected === key
        const color = GENRE_COLORS[key] ?? '#1DB954'
        return (
          <button
            key={label}
            onClick={() => onSelect(key)}
            className="genre-pill flex-shrink-0 px-4 py-2 rounded-full text-xs border"
            style={
              active
                ? {
                    ['--pill-glow' as string]: `${color}70`,
                    backgroundColor: `${color}22`,
                    borderColor: color,
                    color,
                  }
                : {
                    ['--pill-glow' as string]: `${color}70`,
                    backgroundColor: '#1A1A1A',
                    borderColor: '#2A2A2A',
                    color: '#A0A0A0',
                  }
            }
            data-active={active}
          >
            <span className={active ? 'genre-pill-active inline-block' : 'inline-block'}>
              {label}
            </span>
          </button>
        )
      })}
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
        <div
          className="rounded-xl border p-8 text-center"
          style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}
        >
          {emptyIcon && <div className="flex justify-center mb-3 opacity-20">{emptyIcon}</div>}
          <p className="text-[#A0A0A0] text-sm mb-4">{emptyMessage ?? 'Nothing here yet.'}</p>
          {emptyCTA && (
            <Link
              href={emptyCTA.href}
              className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 text-black"
              style={{ backgroundColor: '#1DB954' }}
            >
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

// ─── Genre filter for musicians ───────────────────────────────────────────────
function filterM(items: FeedMusician[], genre: string): FeedMusician[] {
  if (genre === 'all') return items
  return items.filter(m => m.genre?.some(g => normalizeGenre(g) === genre))
}

// ─── Role-aware hero profiles ─────────────────────────────────────────────────
function toHeroMusician(m: FeedMusician): HeroProfile {
  return { id: m.id, name: m.stage_name ?? 'Artist', bio: m.bio, genre: m.genre, city: m.city, state: m.state, type: 'musician', profile_image: m.profile_image, is_available: m.is_available, hourly_rate: m.hourly_rate }
}

function toHeroVenue(v: FeedVenue): HeroProfile {
  return { id: v.id, name: v.name ?? 'Venue', bio: v.bio, genre: null, city: v.city, state: v.state, type: 'venue', profile_image: v.profile_image }
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

  // Fetch the logged-in user's city from their profile for "Near You" rows
  useEffect(() => {
    if (!user || !userRole) return
    const table = userRole === 'musician' ? 'musicians' : userRole === 'venue' ? 'venues' : 'event_hosts'
    supabase.from(table as 'musicians').select('city').eq('id', user.id).single().then(({ data }) => {
      if (data?.city) setUserCity(data.city)
    })
  }, [user, userRole])

  // Fetch feed data — re-fetches when city resolves but not on genre change (filtered client-side)
  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams({ city: userCity })
    setLoading(true)
    fetch(`/api/feed?${params}`)
      .then(r => r.json())
      .then((data: FeedData) => { setFeedData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, userCity])

  // Build role-aware hero profiles
  const heroProfiles: HeroProfile[] = (() => {
    if (!feedData) return []
    if (userRole === 'musician') return feedData.featured.venues.map(toHeroVenue)
    if (userRole === 'venue')    return feedData.featured.musicians.map(toHeroMusician)
    // host: mix musicians + venues alternating
    const mix: HeroProfile[] = []
    const m = feedData.featured.musicians.map(toHeroMusician)
    const v = feedData.featured.venues.map(toHeroVenue)
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0 && m[Math.floor(i / 2)]) mix.push(m[Math.floor(i / 2)])
      else if (v[Math.floor(i / 2)]) mix.push(v[Math.floor(i / 2)])
    }
    return mix.slice(0, 5)
  })()

  // Greeting that changes by time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting

  // ── MUSICIAN ROWS ──────────────────────────────────────────────────────────
  if (userRole === 'musician') {
    const nearVenues = feedData?.venues.nearYou ?? []
    const allVenues = feedData?.venues.all ?? []
    const trendingVenues = feedData?.venues.trending ?? []
    const musicMedia = filterM(feedData?.musicians.withMedia ?? [], selectedGenre)

    return (
      <FeedLayout greeting={greetingText} role={userRole} loading={loading} feedData={feedData} heroProfiles={heroProfiles} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
        <ContentRow title="Venues Near You" seeAllHref="/venues" loading={loading}
          empty={nearVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage={userCity ? `No venues in ${userCity} yet — showing all` : 'No venues nearby yet.'}
        >
          {(nearVenues.length > 0 ? nearVenues : allVenues).map(v => <VenueCard key={v.id} venue={v} />)}
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
          empty={trendingVenues.length === 0}
          emptyIcon={<Building2 className="w-10 h-10" />}
          emptyMessage="Check back soon."
        >
          {trendingVenues.map(v => <VenueCard key={v.id} venue={v} trending />)}
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
          emptyMessage="No venues yet — add yours!"
          emptyCTA={{ label: 'List Your Venue', href: '/signup' }}
        >
          {allVenues.slice(0, 10).map(v => <VenueCard key={v.id} venue={v} />)}
        </ContentRow>
      </FeedLayout>
    )
  }

  // ── VENUE ROWS ─────────────────────────────────────────────────────────────
  if (userRole === 'venue') {
    const nearM = filterM(feedData?.musicians.nearYou ?? [], selectedGenre)
    const allM = filterM(feedData?.musicians.all ?? [], selectedGenre)
    const trendingM = filterM(feedData?.musicians.trending ?? [], selectedGenre)
    const withMedia = filterM(feedData?.musicians.withMedia ?? [], selectedGenre)

    return (
      <FeedLayout greeting={greetingText} role={userRole} loading={loading} feedData={feedData} heroProfiles={heroProfiles} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
        <ContentRow title="Musicians Near You" seeAllHref="/musicians" loading={loading}
          empty={nearM.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage={userCity ? `No musicians in ${userCity} yet — showing all` : 'No musicians nearby yet.'}
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
          empty={trendingM.length === 0}
          emptyIcon={<Music2 className="w-10 h-10" />}
          emptyMessage="Check back soon for trending artists."
        >
          {trendingM.map(m => <MusicianCard key={m.id} musician={m} trending />)}
        </ContentRow>

        <ContentRow title="Top Artists by Genre" seeAllHref={`/musicians`} loading={loading}
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

  // ── HOST ROWS ──────────────────────────────────────────────────────────────
  const trendingM = filterM(feedData?.musicians.trending ?? [], selectedGenre)
  const allVenues = feedData?.venues.all ?? []
  const allM = filterM(feedData?.musicians.all ?? [], selectedGenre)
  const trendingV = feedData?.venues.trending ?? []
  const withMedia = filterM(feedData?.musicians.withMedia ?? [], selectedGenre)

  return (
    <FeedLayout greeting={greetingText} role={userRole} loading={loading} feedData={feedData} heroProfiles={heroProfiles} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre}>
      <ContentRow title="Top Musicians This Week" seeAllHref="/musicians" loading={loading}
        empty={trendingM.length === 0}
        emptyIcon={<Music2 className="w-10 h-10" />}
        emptyMessage="No musicians yet."
        emptyCTA={{ label: 'Browse Musicians', href: '/musicians' }}
      >
        {trendingM.map(m => <MusicianCard key={m.id} musician={m} trending />)}
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
        emptyMessage="No musicians yet — be the first!"
        emptyCTA={{ label: 'Get Listed', href: '/signup' }}
      >
        {allM.map(m => <MusicianCard key={m.id} musician={m} />)}
      </ContentRow>

      <ContentRow title="Trending Venues" seeAllHref="/venues" loading={loading}
        empty={trendingV.length === 0}
        emptyIcon={<Building2 className="w-10 h-10" />}
        emptyMessage="No trending venues yet."
      >
        {trendingV.map(v => <VenueCard key={v.id} venue={v} trending />)}
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

// ─── Shared layout wrapper ────────────────────────────────────────────────────
interface FeedLayoutProps {
  greeting: string
  role: string | undefined
  loading: boolean
  feedData: FeedData | null
  heroProfiles: HeroProfile[]
  selectedGenre: string
  onGenreSelect: (g: string) => void
  children: ReactNode
}

function FeedLayout({ greeting, role, loading, heroProfiles, selectedGenre, onGenreSelect, children }: FeedLayoutProps) {
  return (
    <>
      <Head>
        <title>Discover | BandBridge</title>
      </Head>
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#0D0D0D', paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Greeting */}
          <div className="pt-6 pb-5">
            <h1 className="font-playfair font-black text-2xl sm:text-3xl text-[#F0F0F0]">{greeting}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1 font-space-mono">
              {role === 'musician' ? '// your stage is waiting' : role === 'venue' ? '// find your next artist' : '// discover the perfect sound'}
            </p>
          </div>

          {/* Hero */}
          {loading ? (
            <div className="skeleton-shimmer rounded-2xl mb-8" style={{ height: 'min(70vh, 580px)', minHeight: '380px' }} />
          ) : heroProfiles.length > 0 ? (
            <div className="mb-8">
              <HeroPanel profiles={heroProfiles} role={role} />
            </div>
          ) : null}

          {/* Genre filter */}
          <GenreFilter selected={selectedGenre} onSelect={onGenreSelect} />

          {/* Content rows */}
          <div className="space-y-12">{children}</div>
        </div>
      </div>
    </>
  )
}
