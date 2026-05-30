import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default function handler(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#121212',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Green radial glow — top left */}
        <div
          style={{
            position: 'absolute',
            top: '-140px',
            left: '-140px',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,185,84,0.32) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Green radial glow — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            right: '-100px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,185,84,0.16) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Subtle grid lines decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '380px',
            background: 'linear-gradient(to left, rgba(29,185,84,0.04), transparent)',
            display: 'flex',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '52px' }}>
          {/* Icon badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#1DB954',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '34px', color: '#000000', display: 'flex', lineHeight: 1 }}>
              ♪
            </div>
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                display: 'flex',
              }}
            >
              Band
            </div>
            <div
              style={{
                fontSize: '46px',
                fontWeight: 800,
                color: '#1DB954',
                letterSpacing: '-1.5px',
                display: 'flex',
              }}
            >
              Bridge
            </div>
          </div>
        </div>

        {/* Tagline — two lines so the green accent pops */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-2.5px',
              lineHeight: 1.05,
              display: 'flex',
            }}
          >
            Your music deserves
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#1DB954',
              letterSpacing: '-2.5px',
              lineHeight: 1.05,
              display: 'flex',
            }}
          >
            a bigger stage.
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '26px',
            color: '#B3B3B3',
            fontWeight: 400,
            letterSpacing: '-0.3px',
            display: 'flex',
          }}
        >
          Connect musicians with venues. Only 5% booking fee.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
