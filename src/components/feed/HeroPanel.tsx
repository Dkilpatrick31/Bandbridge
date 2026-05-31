import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Music, Building2 } from 'lucide-react'
import type { HeroProfile } from './types'
import { getGenreColorForArray } from './types'

interface HeroPanelProps {
  profiles: HeroProfile[]
  role?: string
}

export default function HeroPanel({ profiles, role }: HeroPanelProps) {
  const [idx, setIdx] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((nextIdx: number) => {
    setFlashing(true)
    setTimeout(() => {
      setIdx(nextIdx)
      setFlashing(false)
    }, 110)
  }, [])

  const advance = useCallback(() => {
    go((idx + 1) % profiles.length)
  }, [go, idx, profiles.length])

  useEffect(() => {
    if (profiles.length <= 1 || paused) return
    timerRef.current = setInterval(advance, 8000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advance, profiles.length, paused])

  if (!profiles.length) return null

  const p = profiles[idx]
  const accentColor = getGenreColorForArray(p.genre)
  const isMusician = p.type === 'musician'
  const profileHref = isMusician ? `/musicians/${p.id}` : `/venues/${p.id}`

  // CTA labels are role-aware (what the viewer wants to do)
  const primaryCTA = isMusician ? 'View Profile' : 'View Venue'
  const secondaryCTA = isMusician ? 'Book Now' : 'Learn More'

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 'min(70vh, 580px)', minHeight: '380px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
            background: `radial-gradient(ellipse at 30% 40%, ${accentColor}22 0%, #0D0D0D 70%)`,
          }}
        />
      )}

      {/* Dual gradient overlay: left vignette + bottom */}
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

          {/* Location */}
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

      {/* Nav arrows */}
      {profiles.length > 1 && (
        <>
          <button
            onClick={() => go((idx - 1 + profiles.length) % profiles.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all border border-white/15 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go((idx + 1) % profiles.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all border border-white/15 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 right-5 flex gap-1.5 items-center z-10">
            {profiles.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === idx ? accentColor : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Role indicator top-right */}
      <div className="absolute top-4 right-4 z-10 font-space-mono text-[10px] text-[#A0A0A0]/60 uppercase tracking-widest hidden sm:block">
        {role === 'musician' ? 'Discover Venues' : role === 'venue' ? 'Find Artists' : 'Discover'}
      </div>
    </div>
  )
}
