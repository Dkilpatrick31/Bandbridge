import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Music, Building2 } from 'lucide-react'
import type { HeroProfile } from './types'
import { getGenreColorForArray } from './types'

interface HeroPanelProps {
  profiles: HeroProfile[]
  role?: string
  /** Set by the genre filter to jump to a matching profile. */
  startIdx?: number
}

type Dir = 'forward' | 'backward'
type SlideIn  = { idx: number; key: number; dir: Dir }
type BgOverlay = { idx: number; key: number }

// ─── Sub-components ───────────────────────────────────────────────────────────

function BgLayer({ p }: { p: HeroProfile }) {
  const accent = getGenreColorForArray(p.genre)
  return p.profile_image ? (
    <div
      className="hero-bokeh absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${p.profile_image})` }}
    />
  ) : (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse at 22% 65%, ${accent}50 0%, transparent 52%),
          radial-gradient(ellipse at 72% 25%, ${accent}28 0%, transparent 45%),
          radial-gradient(ellipse at 50% 105%, ${accent}18 0%, transparent 38%),
          #0D0D0D
        `,
      }}
    />
  )
}

function CardContent({ p }: { p: HeroProfile }) {
  const accent     = getGenreColorForArray(p.genre)
  const isMusician = p.type === 'musician'
  const href       = isMusician ? `/musicians/${p.id}` : `/venues/${p.id}`

  return (
    <div className="absolute inset-0 flex items-end">
      <div className="w-full md:w-[55%] lg:w-[48%] px-7 sm:px-10 pb-8 sm:pb-12">

        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent }}>
            {isMusician ? <Music className="w-2.5 h-2.5 text-black" /> : <Building2 className="w-2.5 h-2.5 text-black" />}
          </div>
          <span className="font-space-mono text-xs uppercase tracking-widest" style={{ color: accent }}>
            {isMusician ? 'Featured Artist' : 'Featured Venue'}
          </span>
        </div>

        {/* Name */}
        <h2 className="font-playfair font-black text-white leading-none mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          {p.name}
        </h2>

        {/* Location + rate */}
        {(p.city || p.state) && (
          <div className="flex items-center gap-1.5 text-[#A0A0A0] text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
            {[p.city, p.state].filter(Boolean).join(', ')}
            {p.hourly_rate && (
              <>
                <span className="mx-2 opacity-30">·</span>
                <span style={{ color: accent }} className="font-semibold">${p.hourly_rate}/hr</span>
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
                style={{ borderColor: `${accent}50`, color: accent, backgroundColor: `${accent}12` }}
              >
                {g.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {p.bio && (
          <p className="text-[#A0A0A0] text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 max-w-md">{p.bio}</p>
        )}

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href={href}
            className="font-semibold text-sm px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg text-black"
            style={{ backgroundColor: accent, boxShadow: `0 6px 24px -4px ${accent}70` }}
          >
            {isMusician ? 'View Profile' : 'View Venue'}
          </Link>
          <Link
            href={href}
            className="text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all border border-white/30 hover:bg-white/10 backdrop-blur-sm"
          >
            {isMusician ? 'Book Now' : 'Learn More'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HeroPanel({ profiles, role, startIdx = 0 }: HeroPanelProps) {
  // shownIdx: the settled, fully visible slide — updated at 480ms when card locks in.
  const [shownIdx, setShownIdx]   = useState(0)
  // slideIn: drives the card slide animation (null = idle).
  const [slideIn, setSlideIn]     = useState<SlideIn | null>(null)
  // baseIdx: the background that's always at full opacity underneath.
  const [baseIdx, setBaseIdx]     = useState(0)
  // bgOverlay: incoming background that fades in over 600ms, then is removed.
  const [bgOverlay, setBgOverlay] = useState<BgOverlay | null>(null)
  const [paused, setPaused]       = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Refs for stable callbacks that need the latest values.
  const shownIdxRef    = useRef(0)
  const transitionRef  = useRef(false)   // true during the 480ms window — blocks double-fire
  const keyRef         = useRef(0)
  const startIdxRef    = useRef(startIdx)

  // go() is intentionally stable (empty deps). It reads current values via refs
  // and blocks new navigations while a transition is in progress.
  const go = useCallback((targetIdx: number, dir?: Dir) => {
    if (transitionRef.current) return
    if (targetIdx === shownIdxRef.current) return

    transitionRef.current   = true
    const key               = ++keyRef.current
    const autoDir: Dir      = targetIdx > shownIdxRef.current ? 'forward' : 'backward'

    // Update ref immediately so advance() and startIdx effect see the pending value.
    shownIdxRef.current = targetIdx

    setSlideIn({ idx: targetIdx, key, dir: dir ?? autoDir })
    setBgOverlay({ idx: targetIdx, key })

    // Card lock-in at 480ms — also unblocks the next click.
    setTimeout(() => {
      setShownIdx(targetIdx)
      setSlideIn(null)
      transitionRef.current = false
    }, 480)

    // Background cleanup at 600ms — base switches to new profile, overlay removed.
    setTimeout(() => {
      setBaseIdx(targetIdx)
      setBgOverlay(null)
    }, 600)
  }, [])

  // advance() is stable. shownIdx is NOT in deps; we use the ref instead.
  const advance = useCallback(() => {
    go((shownIdxRef.current + 1) % profiles.length)
  }, [go, profiles.length])

  // Auto-advance. shownIdx in deps restarts the 8s timer after each navigation,
  // keeping it in sync with the progress bar animation.
  useEffect(() => {
    if (paused || profiles.length <= 1) return
    const t = setInterval(advance, 8000)
    return () => clearInterval(t)
  }, [advance, profiles.length, paused, shownIdx])

  // Genre-filter jump: fires only when startIdx prop actually changes.
  useEffect(() => {
    if (startIdx === startIdxRef.current) return
    startIdxRef.current = startIdx
    go(startIdx)
  }, [startIdx, go])

  if (!profiles.length) return null

  const safeShown = Math.min(shownIdx, profiles.length - 1)

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: 'min(70vh, 580px)', minHeight: '380px' }}
      onMouseEnter={() => { setPaused(true);  setIsHovered(true)  }}
      onMouseLeave={() => { setPaused(false); setIsHovered(false) }}
    >
      {/* ── Background layers ────────────────────────────────────────────────── */}
      {/* Base: settled bg, always fully opaque. */}
      <div className="absolute inset-0">
        <BgLayer p={profiles[baseIdx]} />
      </div>
      {/* Overlay: incoming bg fades in (0→1) over 600ms via CSS animation. */}
      {bgOverlay && (
        <div key={bgOverlay.key} className="absolute inset-0 hero-bg-in">
          <BgLayer p={profiles[bgOverlay.idx]} />
        </div>
      )}

      {/* ── Gradient overlay (vignette) ──────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.75) 45%, rgba(13,13,13,0.2) 100%),
            linear-gradient(to top,  rgba(13,13,13,0.95) 0%, transparent 55%)
          `,
        }}
      />

      {/* ── Card slides ──────────────────────────────────────────────────────── */}
      {/*
        overflow-hidden clips cards that are off-screen (translateX ±100%).
        z-index sits above backgrounds + vignette but below arrows/indicators.
      */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 10 }}>
        {/*
          Outgoing card. Key changes at 480ms when shownIdx updates, which
          remounts it as the new settled card with no animation class applied.
          While slideIn is active the animation class slides the old content out.
        */}
        <div
          key={`out-${safeShown}`}
          className={`absolute inset-0 ${
            slideIn
              ? slideIn.dir === 'forward'
                ? 'hero-card-out-fwd'
                : 'hero-card-out-bwd'
              : ''
          }`}
        >
          <CardContent p={profiles[safeShown]} />
        </div>

        {/* Incoming card. Keyed by the unique transition key so animation always
            starts fresh. Removed when slideIn becomes null at 480ms. */}
        {slideIn && (
          <div
            key={slideIn.key}
            className={`absolute inset-0 ${
              slideIn.dir === 'forward' ? 'hero-card-in-fwd' : 'hero-card-in-bwd'
            }`}
          >
            <CardContent p={profiles[slideIn.idx]} />
          </div>
        )}
      </div>

      {/* ── Left arrow ───────────────────────────────────────────────────────── */}
      {profiles.length > 1 && (
        <button
          onClick={() => go((shownIdxRef.current - 1 + profiles.length) % profiles.length, 'backward')}
          className="hero-arrow absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center"
          style={{
            zIndex: 20,
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

      {/* ── Right arrow ──────────────────────────────────────────────────────── */}
      {profiles.length > 1 && (
        <button
          onClick={() => go((shownIdxRef.current + 1) % profiles.length, 'forward')}
          className="hero-arrow absolute right-0 top-0 bottom-0 w-14 flex items-center justify-center"
          style={{
            zIndex: 20,
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

      {/* ── Progress bars ────────────────────────────────────────────────────── */}
      {profiles.length > 1 && (
        <div className="absolute bottom-4 right-5 flex gap-2 items-center" style={{ zIndex: 20 }}>
          {profiles.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="relative rounded-full overflow-hidden flex-shrink-0"
              style={{
                width: i === safeShown ? '32px' : '16px',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                transition: 'width 300ms ease',
              }}
              aria-label={`Go to slide ${i + 1}`}
            >
              {/* Fill bar restarts animation whenever safeShown changes
                  because the element is unmounted (i !== safeShown) then
                  remounted fresh (i === safeShown). */}
              {i === safeShown && (
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

      {/* ── Role label ───────────────────────────────────────────────────────── */}
      <div
        className="absolute top-4 right-4 font-space-mono text-[10px] text-[#A0A0A0]/60 uppercase tracking-widest hidden sm:block"
        style={{ zIndex: 20 }}
      >
        {role === 'musician' ? 'Discover Venues' : role === 'venue' ? 'Find Artists' : 'Discover'}
      </div>
    </div>
  )
}
