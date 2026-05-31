import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Music } from 'lucide-react'

export interface FeedMusician {
  id: string
  stage_name: string | null
  bio: string | null
  genre: string[] | null
  city: string | null
  state: string | null
  hourly_rate: number | null
  spotify_url: string | null
  youtube_url: string | null
  profile_image: string | null
  is_available: boolean | null
}

interface HeroPanelProps {
  profiles: FeedMusician[]
}

export default function HeroPanel({ profiles }: HeroPanelProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % profiles.length)
  }, [profiles.length])

  const prev = () => setCurrent(prev => (prev - 1 + profiles.length) % profiles.length)

  useEffect(() => {
    if (profiles.length <= 1 || paused) return
    const t = setInterval(next, 8000)
    return () => clearInterval(t)
  }, [next, profiles.length, paused])

  if (!profiles.length) return null

  const p = profiles[current]

  return (
    <div
      className="relative h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-[#1E1E1E] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      {p.profile_image ? (
        <img
          key={p.id}
          src={p.profile_image}
          alt={p.stage_name ?? 'Artist'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/25 via-[#1a2a1a] to-[#121212]">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Music className="w-48 h-48 text-[#1DB954]" />
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
        {p.genre && p.genre.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {p.genre.slice(0, 3).map(g => (
              <span key={g} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                {g.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-white text-3xl sm:text-5xl font-black leading-tight mb-2 drop-shadow-lg">
          {p.stage_name}
        </h2>

        {(p.city || p.state) && (
          <div className="flex items-center gap-1.5 text-white/70 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {[p.city, p.state].filter(Boolean).join(', ')}
          </div>
        )}

        {p.bio && (
          <p className="text-white/75 text-sm sm:text-base max-w-lg mb-5 line-clamp-2 leading-relaxed">
            {p.bio}
          </p>
        )}

        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/musicians/${p.id}`}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-[#1DB954]/30"
          >
            View Profile
          </Link>
          <Link
            href={`/musicians/${p.id}`}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all border border-white/30"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {profiles.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-5 right-6 flex gap-1.5 items-center">
            {profiles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-1.5 bg-[#1DB954]'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
