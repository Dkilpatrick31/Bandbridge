import Link from 'next/link'
import { MapPin, Music2, Building2, Flame, ExternalLink } from 'lucide-react'
import type { FeedMusician, FeedVenue } from './types'
import { getGenreColorForArray, getGenreColor, getYoutubeThumbnail } from './types'

// ─── Waveform SVG ────────────────────────────────────────────────────────────
function AudioWaveform({ color }: { color: string }) {
  const heights = [5, 10, 14, 8, 16, 11, 9, 13, 6, 15, 10, 7, 12]
  return (
    <svg viewBox="0 0 56 16" className="w-full" style={{ height: '16px' }} aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4 + 0.5}
          y={(16 - h) / 2}
          width="3"
          height={h}
          rx="1.5"
          fill={color}
          opacity="0.55"
          className="waveform-bar"
          style={{ animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </svg>
  )
}

// ─── Capacity bar ────────────────────────────────────────────────────────────
function CapacityBar({ capacity, color }: { capacity: number | null; color: string }) {
  const pct = capacity ? Math.min(Math.round((capacity / 3000) * 100), 100) : 28
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[#A0A0A0] text-[10px] font-space-mono uppercase tracking-wider">
          {capacity ? `Cap ${capacity.toLocaleString()}` : 'Intimate'}
        </span>
        <span style={{ color }} className="text-[10px] font-space-mono">{pct}%</span>
      </div>
      <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}88, ${color})` }}
        />
      </div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function FeedCardSkeleton() {
  return (
    <div className="feed-card min-w-[220px] sm:min-w-[255px]" style={{ height: '290px' }}>
      <div className="skeleton-shimmer" style={{ height: '155px' }} />
      <div className="p-4 space-y-2.5 flex-1">
        <div className="skeleton-shimmer rounded h-4 w-3/4" />
        <div className="skeleton-shimmer rounded h-3 w-1/2" />
        <div className="skeleton-shimmer rounded h-3 w-2/3 mt-1" />
        <div className="skeleton-shimmer rounded-full h-7 mt-3" />
      </div>
    </div>
  )
}

// ─── Musician card ───────────────────────────────────────────────────────────
interface MusicianCardProps {
  musician: FeedMusician
  trending?: boolean
  bookingBadge?: boolean
  mediaMode?: boolean
}

export function MusicianCard({ musician, trending, mediaMode }: MusicianCardProps) {
  const accentColor = getGenreColorForArray(musician.genre)
  const href = `/musicians/${musician.id}`
  const ytThumb = getYoutubeThumbnail(musician.youtube_url)
  const imageSrc = mediaMode ? (ytThumb ?? musician.profile_image) : musician.profile_image
  const hasMedia = !!(musician.spotify_url || musician.youtube_url)

  return (
    <Link
      href={href}
      className="min-w-[220px] sm:min-w-[255px] block"
      style={{ ['--card-glow' as string]: `${accentColor}60` }}
    >
      <div className="feed-card h-full" style={{ borderTopColor: accentColor, borderTopWidth: '3px' }}>

        {/* Image */}
        <div className="relative flex-shrink-0" style={{ height: '155px', backgroundColor: '#111' }}>
          {imageSrc ? (
            <img src={imageSrc} alt={musician.stage_name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle at 50% 40%, ${accentColor}22, #111)` }}
            >
              <span className="font-playfair font-black text-5xl opacity-15 select-none" style={{ color: accentColor }}>
                {(musician.stage_name ?? 'M')[0].toUpperCase()}
              </span>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {trending && (
              <span className="flex items-center gap-1 text-[10px] font-space-mono font-bold px-2 py-0.5 rounded-full text-black"
                style={{ backgroundColor: '#F5A623' }}>
                <Flame className="w-2.5 h-2.5" /> Trending
              </span>
            )}
            {mediaMode && (
              <div className="flex gap-1">
                {musician.youtube_url && <span className="text-[9px] font-space-mono font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white">YT</span>}
                {musician.spotify_url && <span className="text-[9px] font-space-mono font-bold px-1.5 py-0.5 rounded-full text-black" style={{ backgroundColor: '#1DB954' }}>SP</span>}
              </div>
            )}
          </div>
          {musician.is_available && !trending && !mediaMode && (
            <span className="absolute top-2 right-2 text-[9px] font-space-mono font-bold px-2 py-0.5 rounded-full text-black" style={{ backgroundColor: accentColor }}>
              Available
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-playfair font-bold text-[#F0F0F0] text-sm truncate mb-0.5 leading-snug">
            {musician.stage_name}
          </h3>

          {(musician.city || musician.state) && (
            <div className="flex items-center gap-1 mb-2" style={{ color: '#A0A0A0' }}>
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="text-[11px] truncate">{[musician.city, musician.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {musician.genre && musician.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {musician.genre.slice(0, 2).map(g => (
                <span
                  key={g}
                  className="font-space-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                  style={{ color: getGenreColor(g), backgroundColor: `${getGenreColor(g)}18` }}
                >
                  {g.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {musician.hourly_rate != null && (
            <span className="text-xs font-semibold mb-3" style={{ color: accentColor }}>
              ${musician.hourly_rate}/hr
            </span>
          )}

          {/* Waveform or CTA */}
          <div className="mt-auto">
            {hasMedia ? (
              <AudioWaveform color={accentColor} />
            ) : (
              <div
                className="text-black text-xs font-bold py-2 rounded-full text-center transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                {mediaMode ? (
                  <span className="flex items-center justify-center gap-1"><ExternalLink className="w-3 h-3" />Listen Now</span>
                ) : 'View Profile'}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Venue card ───────────────────────────────────────────────────────────────
interface VenueCardProps {
  venue: FeedVenue
  trending?: boolean
  bookingBadge?: boolean
}

export function VenueCard({ venue, trending, bookingBadge }: VenueCardProps) {
  const accentColor = '#F5A623' // amber for venues
  const href = `/venues/${venue.id}`

  return (
    <Link
      href={href}
      className="min-w-[220px] sm:min-w-[255px] block"
      style={{ ['--card-glow' as string]: `${accentColor}55` }}
    >
      <div className="feed-card h-full" style={{ borderTopColor: accentColor, borderTopWidth: '3px' }}>

        <div className="relative flex-shrink-0" style={{ height: '155px', backgroundColor: '#111' }}>
          {venue.profile_image ? (
            <img src={venue.profile_image} alt={venue.name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle at 50% 40%, ${accentColor}18, #111)` }}
            >
              <Building2 className="w-12 h-12 opacity-10" style={{ color: accentColor }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 flex gap-1">
            {trending && (
              <span className="flex items-center gap-1 text-[10px] font-space-mono font-bold px-2 py-0.5 rounded-full text-black"
                style={{ backgroundColor: accentColor }}>
                <Flame className="w-2.5 h-2.5" /> Trending
              </span>
            )}
            {bookingBadge && (
              <span className="text-[9px] font-space-mono font-bold px-2 py-0.5 rounded-full text-black"
                style={{ backgroundColor: '#1DB954' }}>
                Now Booking
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-playfair font-bold text-[#F0F0F0] text-sm truncate mb-0.5 leading-snug">
            {venue.name}
          </h3>

          {(venue.city || venue.state) && (
            <div className="flex items-center gap-1 mb-2" style={{ color: '#A0A0A0' }}>
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="text-[11px] truncate">{[venue.city, venue.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {venue.bio && (
            <p className="text-[11px] leading-relaxed mb-2 line-clamp-2" style={{ color: '#A0A0A0' }}>
              {venue.bio}
            </p>
          )}

          <div className="mt-auto space-y-2.5">
            <CapacityBar capacity={venue.capacity} color={accentColor} />
            <div
              className="text-black text-xs font-bold py-2 rounded-full text-center"
              style={{ backgroundColor: accentColor }}
            >
              View Venue
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
