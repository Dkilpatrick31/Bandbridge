import Head from 'next/head'
import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Music2, Building2, Calendar, Check, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const GENRES = ['Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'R&B', 'Hip-Hop', 'EDM', 'Latin', 'Folk', 'Indie', 'Classical']

const inputCls = 'w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50'
const labelCls = 'text-[#B3B3B3] text-sm mb-1.5 block'

export default function SignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [role, setRole] = useState<'musician' | 'venue' | 'host' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  // Host-specific
  const [hostPhone, setHostPhone] = useState('')
  const [hostEventType, setHostEventType] = useState('')
  const [hostEventDate, setHostEventDate] = useState('')
  const [hostBudget, setHostBudget] = useState('')
  const [hostNotes, setHostNotes] = useState('')
  // Venue-specific
  const [streetAddress, setStreetAddress] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [venueWebsiteUrl, setVenueWebsiteUrl] = useState('')
  const [showEmail, setShowEmail] = useState(true)
  const [showPhone, setShowPhone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [feeAgreed, setFeeAgreed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (role === 'host' && !hostEventType) { setError('Please select an event type.'); return }
    if (role === 'venue' && !showEmail && !phone) {
      setError('Please provide at least one contact method for musicians to reach you.')
      return
    }
    if (!feeAgreed) { setError('You must agree to the 5% platform fee.'); return }

    setSubmitting(true)

    const { data, error: signUpError } = await signUp(email, password, { role })
    if (signUpError || !data?.user) {
      setError(signUpError?.message ?? 'Sign up failed.')
      setSubmitting(false)
      return
    }

    const userId = data.user.id

    if (role === 'musician') {
      const { error: insertError } = await supabase.from('musicians').insert({
        id: userId,
        stage_name: name,
        bio,
        genre: genres,
        city,
        state,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        spotify_url: spotifyUrl || null,
        youtube_url: youtubeUrl || null,
        soundcloud_url: soundcloudUrl || null,
      })
      if (insertError) { setError(insertError.message); setSubmitting(false); return }
    } else if (role === 'host') {
      const { error: insertError } = await supabase.from('event_hosts').insert({
        id: userId,
        full_name: name,
        email,
        phone: hostPhone || null,
        city,
        state,
        event_type: hostEventType || null,
        event_date: hostEventDate || null,
        budget_range: hostBudget || null,
        notes: hostNotes || null,
      })
      if (insertError) { setError(insertError.message); setSubmitting(false); return }
    } else {
      const { error: insertError } = await supabase.from('venues').insert({
        id: userId,
        name,
        street_address: streetAddress,
        city,
        state,
        zip_code: zipCode,
        phone: phone || null,
        website_url: venueWebsiteUrl || null,
        show_email: showEmail,
        show_phone: showPhone,
      })
      if (insertError) { setError(insertError.message); setSubmitting(false); return }
    }

    router.push('/dashboard')
  }

  return (
    <>
      <Head>
        <title>Join BandBridge | Get Listed Free</title>
        <meta property="og:title" content="Join BandBridge | Get Listed Free" />
        <meta property="og:description" content="Create your free BandBridge profile as a musician, venue, or event host. Only 5% booking fee." />
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3">Join BandBridge</h1>
            <p className="text-[#B3B3B3] text-lg">Musician, venue, or planning a private event?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {([
              { key: 'musician', icon: Music2, title: "I'm a Musician / Band", desc: 'Get discovered, book more gigs, and get paid fairly.' },
              { key: 'venue', icon: Building2, title: "I'm a Venue", desc: 'Find the perfect artist for any night, any genre.' },
              { key: 'host', icon: Calendar, title: "I'm an Event Host", desc: 'Planning a wedding, party, or private event? Find the perfect musician.' },
            ] as const).map(({ key, icon: Icon, title, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  role === key ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-white/10 bg-[#1E1E1E] hover:border-white/30'
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5 space-y-4">
                <h2 className="text-white font-bold text-lg">Account Details</h2>

                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors p-1"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5 space-y-4">
                <h2 className="text-white font-bold text-lg">
                  {role === 'musician' ? 'Musician Details' : role === 'venue' ? 'Venue Details' : 'Event Host Details'}
                </h2>

                <div>
                  <label className={labelCls}>
                    {role === 'musician' ? 'Stage Name / Band Name' : role === 'venue' ? 'Venue Name' : 'Full Name'}
                  </label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder={role === 'musician' ? 'e.g. The Midnight Riders' : role === 'venue' ? 'e.g. The Rusty Nail Bar' : 'Jane Smith'}
                    className={inputCls}
                  />
                </div>

                {role === 'venue' && (
                  <div>
                    <label className={labelCls}>Street Address</label>
                    <input type="text" required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="123 Main St" className={inputCls} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="Austin" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input type="text" required value={state} onChange={e => setState(e.target.value)} placeholder="TX" maxLength={2} className={inputCls} />
                  </div>
                </div>

                {role === 'venue' && (
                  <>
                    <div>
                      <label className={labelCls}>Zip Code</label>
                      <input type="text" required value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="78701" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Phone Number <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(512) 555-0123" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Website URL <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="url" value={venueWebsiteUrl} onChange={e => setVenueWebsiteUrl(e.target.value)} placeholder="https://yourvenue.com" className={inputCls} />
                    </div>

                    <div className="pt-1">
                      <p className="text-white font-semibold text-sm mb-3">Contact Preferences</p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showEmail}
                            onChange={e => setShowEmail(e.target.checked)}
                            className="w-4 h-4 accent-[#1DB954] flex-shrink-0"
                          />
                          <span className="text-[#B3B3B3] text-sm">Show my email publicly on my profile</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showPhone}
                            onChange={e => setShowPhone(e.target.checked)}
                            className="w-4 h-4 accent-[#1DB954] flex-shrink-0"
                          />
                          <span className="text-[#B3B3B3] text-sm">Show my phone number publicly on my profile</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {role === 'host' && (
                  <>
                    <div>
                      <label className={labelCls}>Phone Number <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="tel" value={hostPhone} onChange={e => setHostPhone(e.target.value)} placeholder="(512) 555-0123" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Event Type</label>
                      <select
                        required
                        value={hostEventType}
                        onChange={e => setHostEventType(e.target.value)}
                        className={inputCls}
                      >
                        <option value="" disabled>Select event type…</option>
                        {['Wedding', 'Birthday Party', 'Corporate Event', 'Private Party', 'Anniversary', 'Graduation', 'Holiday Party', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Approximate Event Date <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="date" value={hostEventDate} onChange={e => setHostEventDate(e.target.value)} className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Approximate Budget <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <select value={hostBudget} onChange={e => setHostBudget(e.target.value)} className={inputCls}>
                        <option value="">Select a range…</option>
                        {['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Additional Notes <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <textarea
                        value={hostNotes}
                        onChange={e => setHostNotes(e.target.value)}
                        rows={3}
                        placeholder="Tell musicians about your event..."
                        className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50 resize-none"
                      />
                    </div>
                  </>
                )}

                {role === 'musician' && (
                  <>
                    <div>
                      <label className={labelCls}>Bio</label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        placeholder="Tell venues a little about yourself..."
                        className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Genres</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {GENRES.map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleGenre(g)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              genres.includes(g)
                                ? 'bg-[#1DB954] border-[#1DB954] text-black'
                                : 'bg-[#282828] border-white/10 text-[#B3B3B3] hover:border-white/30'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Hourly Rate ($)</label>
                      <input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="200" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Spotify Artist URL <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="url" value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} placeholder="https://open.spotify.com/artist/..." className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>YouTube Video URL <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>SoundCloud URL <span className="text-[#B3B3B3]/50">(optional)</span></label>
                      <input type="url" value={soundcloudUrl} onChange={e => setSoundcloudUrl(e.target.value)} placeholder="https://soundcloud.com/your-profile" className={inputCls} />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeAgreed}
                    onChange={e => setFeeAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1DB954] flex-shrink-0"
                  />
                  <span className="text-sm text-[#B3B3B3]">
                    <span className="text-[#1DB954] font-semibold">5% platform fee agreement: </span>
                    I agree that BandBridge charges a 5% fee on all completed bookings, processed via Stripe.
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-base py-4 rounded-full transition-all hover:scale-105"
              >
                {submitting ? 'Creating account…' : 'Create My Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[#B3B3B3] text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[#1DB954] hover:underline font-medium">Log In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
