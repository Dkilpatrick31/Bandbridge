import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Music2, Building2, MapPin, DollarSign, Edit2, LogOut, CalendarX2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface MusicianProfile {
  stage_name: string
  bio: string
  genre: string[]
  city: string
  state: string
  hourly_rate: number | null
  spotify_url: string | null
  youtube_url: string | null
  is_available: boolean
  is_verified: boolean
}

interface VenueProfile {
  name: string
  bio: string
  city: string
  state: string
  capacity: number | null
  website_url: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [profile, setProfile] = useState<MusicianProfile | VenueProfile | null>(null)
  const [role, setRole] = useState<'musician' | 'venue' | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      setProfileLoading(true)
      const userRole = user!.user_metadata?.role as 'musician' | 'venue' | undefined

      if (userRole === 'venue') {
        const { data } = await supabase.from('venues').select('*').eq('id', user!.id).single()
        if (data) { setRole('venue'); setProfile(data) }
      } else {
        const { data } = await supabase.from('musicians').select('*').eq('id', user!.id).single()
        if (data) { setRole('musician'); setProfile(data) }
        else {
          const { data: venueData } = await supabase.from('venues').select('*').eq('id', user!.id).single()
          if (venueData) { setRole('venue'); setProfile(venueData) }
        }
      }
      setProfileLoading(false)
    }

    fetchProfile()
  }, [user])

  async function toggleAvailability() {
    if (!user || role !== 'musician') return
    const current = (profile as MusicianProfile).is_available
    const { error } = await supabase.from('musicians').update({ is_available: !current }).eq('id', user.id)
    if (!error) setProfile(prev => prev ? { ...prev, is_available: !current } as MusicianProfile : prev)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const musicianProfile = role === 'musician' ? profile as MusicianProfile : null
  const venueProfile = role === 'venue' ? profile as VenueProfile : null
  const displayName = musicianProfile?.stage_name ?? venueProfile?.name ?? user.email

  return (
    <>
      <Head>
        <title>Dashboard | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#1DB954] rounded-xl flex items-center justify-center">
                  {role === 'musician' ? <Music2 className="w-6 h-6 text-black" /> : <Building2 className="w-6 h-6 text-black" />}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">{displayName}</h1>
                  <span className="text-[#1DB954] text-sm font-semibold capitalize">{role ?? 'User'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-[#B3B3B3] hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2 bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Profile</h2>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-1.5 text-[#1DB954] hover:text-[#1ed760] text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profile
                </Link>
              </div>

              {profile ? (
                <div className="space-y-4">
                  {(musicianProfile?.bio || venueProfile?.bio) && (
                    <p className="text-[#B3B3B3] text-sm leading-relaxed">
                      {musicianProfile?.bio ?? venueProfile?.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {(musicianProfile?.city || venueProfile?.city) && (
                      <div className="flex items-center gap-1.5 text-[#B3B3B3]">
                        <MapPin className="w-4 h-4 text-[#1DB954]" />
                        {musicianProfile?.city ?? venueProfile?.city}, {musicianProfile?.state ?? venueProfile?.state}
                      </div>
                    )}
                    {musicianProfile?.hourly_rate && (
                      <div className="flex items-center gap-1.5 text-[#B3B3B3]">
                        <DollarSign className="w-4 h-4 text-[#1DB954]" />
                        ${musicianProfile.hourly_rate}/hr
                      </div>
                    )}
                  </div>

                  {musicianProfile && musicianProfile.genre?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {musicianProfile.genre.map(g => (
                        <span key={g} className="bg-[#282828] text-[#B3B3B3] px-3 py-1 rounded-full text-xs font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {musicianProfile && (musicianProfile.spotify_url || musicianProfile.youtube_url) && (
                    <div className="flex gap-3">
                      {musicianProfile.spotify_url && (
                        <a href={musicianProfile.spotify_url} target="_blank" rel="noopener noreferrer"
                          className="text-[#1DB954] text-sm hover:underline">Spotify</a>
                      )}
                      {musicianProfile.youtube_url && (
                        <a href={musicianProfile.youtube_url} target="_blank" rel="noopener noreferrer"
                          className="text-[#1DB954] text-sm hover:underline">YouTube</a>
                      )}
                    </div>
                  )}

                  {venueProfile?.capacity && (
                    <p className="text-[#B3B3B3] text-sm">Capacity: <span className="text-white">{venueProfile.capacity}</span></p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#B3B3B3] text-sm mb-4">Your profile isn&apos;t set up yet.</p>
                  <Link href="/profile/edit" className="bg-[#1DB954] text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-[#1ed760] transition-colors">
                    Set Up Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Availability toggle (musicians only) */}
              {role === 'musician' && musicianProfile && (
                <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-white font-bold text-sm mb-3">Availability</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B3B3B3] text-sm">
                      {musicianProfile.is_available ? 'Available for booking' : 'Not available'}
                    </span>
                    <button
                      onClick={toggleAvailability}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        musicianProfile.is_available ? 'bg-[#1DB954]' : 'bg-[#282828]'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        musicianProfile.is_available ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Account info */}
              <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5">
                <h3 className="text-white font-bold text-sm mb-3">Account</h3>
                <p className="text-[#B3B3B3] text-xs break-all">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings (placeholder) */}
          <div className="mt-6 bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
            <h2 className="text-white font-bold text-lg mb-4">Recent Bookings</h2>
            <div className="text-center py-12 text-[#B3B3B3]">
              <CalendarX2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bookings yet. They&apos;ll appear here once you start booking.</p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
