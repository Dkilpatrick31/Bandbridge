import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Music, Building2 } from 'lucide-react'
import type { HeroProfile } from './types'
import { getGenreColorForArray } from './types'

interface HeroPanelProps {
  profiles: HeroProfile[]
  role?: string
  /** When set, the panel jumps to this index (genre-filter connection). */
  startIdx?: number
}

export default function HeroPanel({ profiles, role, startIdx = 0 }: HeroPanelProps) {
  const [idx, setIdx] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [paused, setPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Refs let callbacks stay stable while always reading current values.
  const idxRef = useRef(0)
  const startIdxRef = useRef(startIdx)

  useEffect(() => { idxRef.current = idx }, [idx])

  const go = useCallback((nextIdx: number) => {
    if (nextIdx === idxRef.current) return
    idxRef.current = nextIdx
    setFlashing(true)
    setTimeout(() => {
      setIdx(nextIdx)
      setFlashing(false)
    }, 110)
  }, [])

  const advance = useCallback(() => {
    go((idxRef.current + 1) % profiles.length)
  }, [go, profiles.length])

  useEffect(() => {
    if (profiles.length <= 1 || paused) return
    const t = setInterval(advance, 8000)
    return () => clearInterval(t)
  }, [advance, profiles.length, paused])

  // Jump when the genre filter changes (startIdx prop changes).
  useEffect(() => {
    if (startIdx === startIdxRef.current) return
    startIdxRef.current = startIdx
    go(startIdx)
  }, [startIdx, go])

  if (!profiles.length) return null

  const safeIdx = Math.min(idx, profiles.length - 1)
  const p = profiles[safeIdx]
  const accentColor = getGenreColorForArray(p.genre)
  const isMusician = p.type === 'musician'
  const profileHref = isMusician ? `/musicians/${p.id}` : `/venues/${p.id}`
  const primaryCTA = isMusician ? 'View Profile' : 'View Venue'
  const secondaryCTA = isMusician ? 'Book Now' : 'Learn More'

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 'min(70vh, 580px)', minHeight: '380px' }}
      onMouseEnter={() => { setPaused(true); setIsHovered(true) }}
      onMouseLeave={() => { setPaused(false); setIsHovered(false) }}
    >
      {/* Bokeh blurred background */}
      {p.profile_image ? (
        <div
          key={`bg-${p.id}`}
          className="hero-bokeh absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${p.profile_image})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 22% 65%, ${accentColor}50 0%, transparent 52%),
              radial-gradient(ellipse at 72% 25%, ${accentColor}28 0%, transparent 45%),
              radial-gradient(ellipse at 50% 105%, ${accentColor}18 0%, transparent 38%),
              #0D0D0D
            `,
          }}
        />
      )}

      {/* Dual gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.75) 45%, rgba(13,13,13,0.2) 100%),
            linear-gradient(to top, rgba(13,13,13,0.95) 0%, transparent 55%)
          `,
        }}
      />

      {/* White flash overlay */}
      {flashing && <div className="hero-flash absolute inset-0 bg-white z-20" />}

      {/* Left arrow — full-height edge band, fades in on hover */}
      {profiles.length > 1 && (
        <button
          onClick={() => go((idxRef.current - 1 + profiles.length) % profiles.length)}
          className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center z-20"
          style={{
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease',
            background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 100%)',
          }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-white drop-shadow" />
        </button>
      )}

      {/* Right arrow */}
      {profiles.length > 1 && (
        <button
          onClick={() => go((idxRef.current + 1) % profiles.length)}
          className="absolute right-0 top-0 bottom-0 w-14 flex items-center justify-center z-20"
          style={{
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease',
            background: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)',
          }}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-white drop-shadow" />
        </button>
      )}

      {/* Content — left column */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="w-full md:w-[55%] lg:w-[48%] px-7 sm:px-10 pb-8 sm:pb-12">

          {/* Profile type badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {isMusician
                ? <Music className="w-2.5 h-2.5 text-black" />
                : <Building2 className="w-2.5 h-2.5 text-black" />
              }
            </div>
            <span
              className="font-space-mono text-xs uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {isMusician ? 'Featured Artist' : 'Featured Venue'}
            </span>
          </div>

          {/* Name */}
          <h2
            className="font-playfair font-black text-white leading-none mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {p.name}
          </h2>

          {/* Location + rate */}
          {(p.city || p.state) && (
            <div className="flex items-center gap-1.5 text-[#A0A0A0] text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
              {[p.city, p.state].filter(Boolean).join(', ')}
              {p.hourly_rate && (
                <>
                  <span className="mx-2 opacity-30">·</span>
                  <span style={{ color: accentColor }} className="font-semibold">${p.hourly_rate}/hr</span>
                </>
              )}
            </div>
          )}

          {/* Genre tags */}
          {p.genre && p.genre.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {p.genre.slice(0, 3).map(g => (
                <span
                  key={g}
                  className="font-space-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: `${accentColor}50`,
                    color: accentColor,
                    backgroundColor: `${accentColor}12`,
                  }}
                >
                  {g.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {p.bio && (
            <p className="text-[#A0A0A0] text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 max-w-md">
              {p.bio}
            </p>
          )}

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href={profileHref}
              className="font-semibold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg text-black"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 6px 24px -4px ${accentColor}70`,
              }}
            >
              {primaryCTA}
            </Link>
            <Link
              href={profileHref}
              className="text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all border border-white/30 hover:bg-white/10 backdrop-blur-sm"
            >
              {secondaryCTA}
            </Link>
          </div>
        </div>
      </div>

      {/* Progress bar indicators */}
      {profiles.length > 1 && (
        <div className="absolute bottom-4 right-5 flex gap-2 items-center z-10">
          {profiles.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="relative rounded-full overflow-hidden flex-shrink-0"
              style={{
                width: i === safeIdx ? '32px' : '16px',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                transition: 'width 300ms ease',
              }}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === safeIdx && (
                <div
                  className="hero-progress-fill absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: 'white',
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Role indicator top-right */}
      <div className="absolute top-4 right-4 z-10 font-space-mono text-[10px] text-[#A0A0A0]/60 uppercase tracking-widest hidden sm:block">
        {role === 'musician' ? 'Discover Venues' : role === 'venue' ? 'Find Artists' : 'Discover'}
      </div>
    </div>
  )
}
