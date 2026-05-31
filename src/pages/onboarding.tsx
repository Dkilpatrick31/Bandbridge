import Head from 'next/head'
import { useState } from 'react'
import { Music2, Building2, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function OnboardingPage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'musician' | 'venue' | null>(null)

  // Pre-fill name from auth metadata if available
  const prefillFirstName = (user?.user_metadata?.first_name as string) ?? ''
  const prefillLastName = (user?.user_metadata?.last_name as string) ?? ''
  const prefillName = [prefillFirstName, prefillLastName].filter(Boolean).join(' ')

  return (
    <>
      <Head>
        <title>Join Band Bridge | Get Listed</title>
        <meta name="description" content="Join BandBridge as a musician or venue." />
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">
              {prefillFirstName ? `Welcome, ${prefillFirstName}!` : 'Join BandBridge'}
            </h1>
            <p className="text-[#B3B3B3] text-lg">Are you a musician/band or a venue?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { key: 'musician', icon: Music2, title: "I'm a Musician / Band", desc: "Get discovered, book more gigs, and get paid fairly." },
              { key: 'venue', icon: Building2, title: "I'm a Venue", desc: "Find the perfect artist for any night, any genre." },
            ].map(({ key, icon: Icon, title, desc }) => (
              <button
                key={key}
                onClick={() => setRole(key as 'musician' | 'venue')}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  role === key
                    ? 'border-[#1DB954] bg-[#1DB954]/10'
                    : 'border-white/10 bg-[#1E1E1E] hover:border-white/30'
                }`}
              >
                {role === key && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-black" />
                  </div>
                )}
                <div className="w-12 h-12 bg-[#282828] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#1DB954]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-[#B3B3B3] text-sm">{desc}</p>
              </button>
            ))}
          </div>

          {role && (
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5 mb-6">
              <h2 className="text-white font-bold text-lg mb-5">
                {role === 'musician' ? 'Musician / Band Details' : 'Venue Details'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[#B3B3B3] text-sm mb-1.5 block">
                    {role === 'musician' ? 'Stage Name / Band Name' : 'Venue Name'}
                  </label>
                  <input type="text" placeholder={role === 'musician' ? 'e.g. The Midnight Riders' : 'e.g. The Rusty Nail Bar'}
                    className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                  />
                </div>
                <div>
                  <label className="text-[#B3B3B3] text-sm mb-1.5 block">Full Name</label>
                  <input type="text" defaultValue={prefillName} placeholder="Your full name"
                    className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                  />
                </div>
                <div>
                  <label className="text-[#B3B3B3] text-sm mb-1.5 block">Email</label>
                  <input type="email" defaultValue={user?.email ?? ''} placeholder="your@email.com"
                    className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#B3B3B3] text-sm mb-1.5 block">City</label>
                    <input type="text" placeholder="Austin"
                      className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                    />
                  </div>
                  <div>
                    <label className="text-[#B3B3B3] text-sm mb-1.5 block">State</label>
                    <input type="text" placeholder="TX"
                      className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                    />
                  </div>
                </div>
                {role === 'musician' && (
                  <>
                    <div>
                      <label className="text-[#B3B3B3] text-sm mb-1.5 block">Spotify Artist URL</label>
                      <input type="url" placeholder="https://open.spotify.com/artist/..."
                        className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[#B3B3B3] text-sm mb-1.5 block">YouTube Video URL</label>
                      <input type="url" placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[#B3B3B3] text-sm mb-1.5 block">Hourly Rate ($)</label>
                      <input type="number" placeholder="200"
                        className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {role && (
            <div className="bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-xl p-4 mb-6 text-sm text-[#B3B3B3]">
              <span className="text-[#1DB954] font-semibold">5% booking fee agreement: </span>
              By creating an account, you agree that BandBridge charges a 5% fee on all completed bookings, processed via Stripe.
            </div>
          )}

          <button
            disabled={!role}
            className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-base py-4 rounded-full transition-all hover:scale-105"
          >
            Create My Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}
