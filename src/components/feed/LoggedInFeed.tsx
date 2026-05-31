import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, ReactNode } from 'react'
import { MapPin, Music2, Building2, Flame, ExternalLink } from 'lucide-react'
import HeroPanel, { type FeedMusician } from './HeroPanel'
import { useAuth } from '@/context/AuthContext'

interface FeedVenue {
  id: string
  name: string | null
  bio: string | null
  city: string | null
  state: string | null
  capacity: number | null
  profile_image: string | null
}

interface FeedData {
  featured: FeedMusician[]
  recentMusicians: FeedMusician[]
  recentVenues: FeedVenue[]
  trending: FeedMusician[]
  withMedia: FeedMusician[]
}

const GENRES = ['All', 'Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'R&B', 'Hip-Hop', 'EDM', 'Latin', 'Folk', 'Indie', 'Classical']

function normalizeGenre(g: string) {
  return g.toLowerCase().replace(/[_\s]+/g, '-')
}

function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 rounded-2xl bg-[#1E1E1E] border border-white/5 overflow-hidden animate-pulse">
      <div className="h-36 bg-[#282828]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-[#282828] rounded w-3/4" />
        <div className="h-3 bg-[#282828] rounded w-1/2" />
        <div className="h-3 bg-[#282828] rounded w-1/3" />
        <div className="h-8 bg-[#282828] rounded-full mt-3" />
      </div>
    </div>
  )
}

function SkeletonHero() {
  return (
    <div className="h-[420px] sm:h-[520px] rounded-2xl bg-[#1E1E1E] animate-pulse mb-8" />
  )
}

// ─── Genre filter ─────────────────────────────────────────────────────────────
function GenreFilter({ selected, onSelect }: { selected: string; onSelect: (g: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
      {GENRES.map(genre => {
        const key = normalizeGenre(genre)
        const active = selected === key
        return (
          <button
            key={genre}
            onClick={() => onSelect(key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              active
                ? 'bg-[#1DB954] border-[#1DB954] text-black'
                : 'bg-[#1E1E1E] border-white/10 text-[#B3B3B3] hover:border-white/30 hover:text-white'
            }`}
          >
            {genre}
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
  isEmpty: boolean
  emptyMessage?: string
  showSignupCTA?: boolean
  children?: ReactNode
}

function ContentRow({ title, seeAllHref, loading, isEmpty, emptyMessage, showSignupCTA, children }: ContentRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-xl sm:text-2xl">{title}</h2>
        <Link href={seeAllHref} className="text-[#1DB954] text-sm font-medium hover:underline flex-shrink-0 ml-4">
          See All →
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isEmpty ? (
        <div className="bg-[#1E1E1E] rounded-2xl p-8 sm:p-10 text-center border border-white/5">
          <p className="text-[#B3B3B3] text-sm mb-4">{emptyMessage ?? 'Nothing here yet.'}</p>
          {showSignupCTA && (
            <Link href="/signup" className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105">
              Get Listed Free →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Musician card ────────────────────────────────────────────────────────────
function MusicianCard({ musician, trending = false }: { musician: FeedMusician; trending?: boolean }) {
  return (
    <Link href={`/musicians/${musician.id}`} className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 block">
      <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden hover:border-[#1DB954]/40 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#1DB954]/10 transition-all h-full flex flex-col">
        {/* Image */}
        <div className="relative h-36 bg-gradient-to-br from-[#282828] to-[#1E1E1E] flex-shrink-0">
          {musician.profile_image ? (
            <img src={musician.profile_image} alt={musician.stage_name ?? 'Artist'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-5xl font-black opacity-10 select-none">
                {(musician.stage_name ?? 'M')[0].toUpperCase()}
              </span>
            </div>
          )}
          {trending && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Flame className="w-2.5 h-2.5" /> Trending
            </div>
          )}
          {musician.is_available && (
            <div className="absolute top-2 right-2 bg-[#1DB954] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              Available
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-bold text-sm truncate mb-1">{musician.stage_name}</h3>
          {(musician.city || musician.state) && (
            <div className="flex items-center gap-1 text-[#B3B3B3] text-xs mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {[musician.city, musician.state].filter(Boolean).join(', ')}
            </div>
          )}
          {musician.genre && musician.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {musician.genre.slice(0, 2).map(g => (
                <span key={g} className="bg-[#282828] text-[#B3B3B3] text-[10px] px-2 py-0.5 rounded-full">
                  {g.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
          {musician.hourly_rate != null && (
            <p className="text-[#1DB954] text-xs font-semibold mb-3">${musician.hourly_rate}/hr</p>
          )}
          <div className="mt-auto bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold py-2 rounded-full text-center transition-colors">
            View Profile
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Venue card ───────────────────────────────────────────────────────────────
function VenueCard({ venue }: { venue: FeedVenue }) {
  return (
    <Link href={`/venues/${venue.id}`} className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 block">
      <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden hover:border-[#1DB954]/40 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#1DB954]/10 transition-all h-full flex flex-col">
        <div className="relative h-36 bg-gradient-to-br from-[#282828] to-[#1E1E1E] flex-shrink-0">
          {venue.profile_image ? (
            <img src={venue.profile_image} alt={venue.name ?? 'Venue'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-12 h-12 text-[#1DB954]/15" />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-bold text-sm truncate mb-1">{venue.name}</h3>
          {(venue.city || venue.state) && (
            <div className="flex items-center gap-1 text-[#B3B3B3] text-xs mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {[venue.city, venue.state].filter(Boolean).join(', ')}
            </div>
          )}
          {venue.capacity != null && (
            <p className="text-[#B3B3B3] text-xs mb-2">Cap: {venue.capacity.toLocaleString()}</p>
          )}
          <div className="mt-auto bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold py-2 rounded-full text-center transition-colors">
            View Venue
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Media card ───────────────────────────────────────────────────────────────
function MediaCard({ musician }: { musician: FeedMusician }) {
  const ytThumb = getYoutubeThumbnail(musician.youtube_url)

  return (
    <Link href={`/musicians/${musician.id}`} className="min-w-[220px] sm:min-w-[260px] flex-shrink-0 block">
      <div className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden hover:border-[#1DB954]/40 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#1DB954]/10 transition-all h-full flex flex-col">
        <div className="relative h-36 bg-[#282828] flex-shrink-0">
          {ytThumb ? (
            <img src={ytThumb} alt={musician.stage_name ?? 'Track'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-10 h-10 text-[#1DB954]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-2 left-2 flex gap-1">
            {musician.youtube_url && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YouTube</span>
            )}
            {musician.spotify_url && (
              <span className="bg-[#1DB954] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Spotify</span>
            )}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-bold text-sm truncate mb-0.5">{musician.stage_name}</h3>
          <p className="text-[#B3B3B3] text-xs mb-3">Latest Release</p>
          <div className="mt-auto flex items-center justify-center gap-1.5 bg-[#282828] hover:bg-[#333] text-white text-xs font-semibold py-2 rounded-full border border-white/10 transition-colors">
            <ExternalLink className="w-3 h-3" />
            Listen Now
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Main feed ────────────────────────────────────────────────────────────────
export default function LoggedInFeed() {
  const { user } = useAuth()
  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('all')

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  useEffect(() => {
    fetch('/api/feed')
      .then(r => r.json())
      .then((data: FeedData) => { setFeedData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Client-side genre filtering (handles both uppercase "COUNTRY" and title case "Country")
  function filterByGenre<T extends { genre?: string[] | null }>(items: T[]): T[] {
    if (selectedGenre === 'all') return items
    return items.filter(m => m.genre?.some(g => normalizeGenre(g) === selectedGenre))
  }

  const musicians = filterByGenre(feedData?.recentMusicians ?? [])
  const trending = filterByGenre(feedData?.trending ?? [])
  const withMedia = filterByGenre(feedData?.withMedia ?? [])

  return (
    <>
      <Head>
        <title>Discover | BandBridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Greeting */}
          <div className="mb-6 pt-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {firstName ? `Good to see you, ${firstName} 👋` : 'Discover'}
            </h1>
            <p className="text-[#B3B3B3] text-sm mt-1">Find your next great show or talent.</p>
          </div>

          {/* Hero */}
          {loading ? (
            <SkeletonHero />
          ) : feedData?.featured && feedData.featured.length > 0 ? (
            <div className="mb-8">
              <HeroPanel profiles={feedData.featured} />
            </div>
          ) : null}

          {/* Genre filter */}
          <GenreFilter selected={selectedGenre} onSelect={setSelectedGenre} />

          {/* Content rows */}
          <div className="space-y-12">

            {/* Recently Joined Musicians */}
            <ContentRow
              title="Recently Joined Musicians"
              seeAllHref="/musicians"
              loading={loading}
              isEmpty={musicians.length === 0}
              emptyMessage="No musicians yet — be the first to get listed!"
              showSignupCTA
            >
              {musicians.slice(0, 10).map(m => <MusicianCard key={m.id} musician={m} />)}
            </ContentRow>

            {/* Featured Venues */}
            <ContentRow
              title="Featured Venues"
              seeAllHref="/venues"
              loading={loading}
              isEmpty={(feedData?.recentVenues ?? []).length === 0}
              emptyMessage="No venues listed yet."
            >
              {(feedData?.recentVenues ?? []).map(v => <VenueCard key={v.id} venue={v} />)}
            </ContentRow>

            {/* New Music */}
            <ContentRow
              title="New Music"
              seeAllHref="/musicians"
              loading={loading}
              isEmpty={withMedia.length === 0}
              emptyMessage="Artists can add Spotify and YouTube links from their dashboard."
            >
              {withMedia.map(m => <MediaCard key={m.id} musician={m} />)}
            </ContentRow>

            {/* Trending */}
            <ContentRow
              title="Trending This Week"
              seeAllHref="/musicians"
              loading={loading}
              isEmpty={trending.length === 0}
              emptyMessage="Check back soon for trending artists."
            >
              {trending.map(m => <MusicianCard key={m.id} musician={m} trending />)}
            </ContentRow>

          </div>
        </div>
      </div>
    </>
  )
}
