import Head from 'next/head'
import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const GENRES = ['Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'R&B', 'Hip-Hop', 'EDM', 'Latin', 'Folk', 'Indie', 'Classical']

const inputCls = 'w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50'
const labelCls = 'text-[#B3B3B3] text-sm mb-1.5 block'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [role, setRole] = useState<'musician' | 'venue' | null>(null)
  const [fetching, setFetching] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Shared
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [bio, setBio] = useState('')

  // Musician only
  const [genres, setGenres] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')

  // Venue only
  const [capacity, setCapacity] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function loadProfile() {
      setFetching(true)
      const userRole = user!.user_metadata?.role as 'musician' | 'venue' | undefined

      if (userRole === 'venue') {
        const { data } = await supabase.from('venues').select('*').eq('id', user!.id).single()
        if (data) {
          setRole('venue')
          setName(data.name ?? '')
          setCity(data.city ?? '')
          setState(data.state ?? '')
          setBio(data.bio ?? '')
          setCapacity(data.capacity?.toString() ?? '')
          setWebsiteUrl(data.website_url ?? '')
        }
      } else {
        const { data } = await supabase.from('musicians').select('*').eq('id', user!.id).single()
        if (data) {
          setRole('musician')
          setName(data.stage_name ?? '')
          setCity(data.city ?? '')
          setState(data.state ?? '')
          setBio(data.bio ?? '')
          setGenres(data.genre ?? [])
          setHourlyRate(data.hourly_rate?.toString() ?? '')
          setSpotifyUrl(data.spotify_url ?? '')
          setYoutubeUrl(data.youtube_url ?? '')
          setWebsiteUrl(data.website_url ?? '')
        } else {
          const { data: venueData } = await supabase.from('venues').select('*').eq('id', user!.id).single()
          if (venueData) {
            setRole('venue')
            setName(venueData.name ?? '')
            setCity(venueData.city ?? '')
            setState(venueData.state ?? '')
            setBio(venueData.bio ?? '')
            setCapacity(venueData.capacity?.toString() ?? '')
          }
        }
      }
      setFetching(false)
    }
    loadProfile()
  }, [user])

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    if (role === 'musician') {
      const { error: updateError } = await supabase.from('musicians').update({
        stage_name: name,
        bio,
        genre: genres,
        city,
        state,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        spotify_url: spotifyUrl || null,
        youtube_url: youtubeUrl || null,
        website_url: websiteUrl || null,
      }).eq('id', user!.id)
      if (updateError) { setError(updateError.message); setSubmitting(false); return }
    } else {
      const { error: updateError } = await supabase.from('venues').update({
        name,
        bio,
        city,
        state,
        capacity: capacity ? parseInt(capacity) : null,
        website_url: websiteUrl || null,
      }).eq('id', user!.id)
      if (updateError) { setError(updateError.message); setSubmitting(false); return }
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Edit Profile | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#B3B3B3] hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white">Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5 space-y-4">
              <div>
                <label className={labelCls}>{role === 'musician' ? 'Stage Name / Band Name' : 'Venue Name'}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls}
                  placeholder={role === 'musician' ? 'e.g. The Midnight Riders' : 'e.g. The Rusty Nail Bar'} />
              </div>

              <div>
                <label className={labelCls}>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Austin" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="TX" maxLength={2} className={inputCls} />
                </div>
              </div>

              {role === 'musician' && (
                <>
                  <div>
                    <label className={labelCls}>Genres</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {GENRES.map(g => (
                        <button key={g} type="button" onClick={() => toggleGenre(g)}
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
                    <label className={labelCls}>Spotify Artist URL</label>
                    <input type="url" value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} placeholder="https://open.spotify.com/artist/..." className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>YouTube Video URL</label>
                    <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                  </div>
                </>
              )}

              {role === 'venue' && (
                <div>
                  <label className={labelCls}>Capacity</label>
                  <input type="number" min="0" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="200" className={inputCls} />
                </div>
              )}

              <div>
                <label className={labelCls}>Website URL</label>
                <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" className={inputCls} />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {success && (
              <p className="text-[#1DB954] text-sm bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-xl px-4 py-3">
                Profile updated successfully!
              </p>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard"
                className="flex-1 text-center border border-white/10 hover:border-white/30 text-[#B3B3B3] hover:text-white font-semibold py-3.5 rounded-full transition-all text-sm">
                Cancel
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-full transition-all hover:scale-105 text-sm">
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
