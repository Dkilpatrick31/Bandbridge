import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Music2, Building2, Calendar, MapPin, DollarSign, Edit2, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import MusicianBookingsPanel from '@/components/booking/MusicianBookingsPanel'
import VenueBookingsPanel from '@/components/booking/VenueBookingsPanel'

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

interface HostProfile {
  full_name: string
  city: string
  state: string
  event_type: string | null
  event_date: string | null
  budget_range: string | null
  notes: string | null
}

type Role = 'musician' | 'venue' | 'host'
type AnyProfile = MusicianProfile | VenueProfile | HostProfile

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  musician: <Music2 className="w-6 h-6 text-black" />,
  venue:    <Building2 className="w-6 h-6 text-black" />,
  host:     <Calendar className="w-6 h-6 text-black" />,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const initialTab = typeof router.query.tab === 'string' ? router.query.tab : undefined
  const [profile, setProfile] = useState<AnyProfile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function fetchProfile() {
      setProfileLoading(true)
      const userRole = user!.user_metadata?.role as Role | undefined

      if (userRole === 'venue') {
        const { data } = await supabase.from('venues').select('*').eq('id', user!.id).single()
        if (data) { setRole('venue'); setProfile(data); setProfileLoading(false); return }
      } else if (userRole === 'host') {
        const { data } = await supabase.from('event_hosts').select('*').eq('id', user!.id).single()
        if (data) { setRole('host'); setProfile(data); setProfileLoading(false); return }
      } else {
        const { data } = await supabase.from('musicians').select('*').eq('id', user!.id).single()
        if (data) { setRole('musician'); setProfile(data); setProfileLoading(false); return }
      }

      // Fallback: probe all tables if metadata is missing
      const { data: m } = await supabase.from('musicians').select('*').eq('id', user!.id).single()
      if (m) { setRole('musician'); setProfile(m); setProfileLoading(false); return }
      const { data: v } = await supabase.from('venues').select('*').eq('id', user!.id).single()
      if (v) { setRole('venue'); setProfile(v); setProfileLoading(false); return }
      const { data: h } = await supabase.from('event_hosts').select('*').eq('id', user!.id).single()
      if (h) { setRole('host'); setProfile(h) }

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

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()
      if (!res.ok) {
        setDeleteError(json.error ?? 'Deletion failed. Please try again.')
        setDeleteLoading(false)
        return
      }
      await signOut()
      router.push('/')
    } catch {
      setDeleteError('An unexpected error occurred. Please try again.')
      setDeleteLoading(false)
    }
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
  const venueProfile    = role === 'venue'    ? profile as VenueProfile    : null
  const hostProfile     = role === 'host'     ? profile as HostProfile     : null

  const displayName =
    musicianProfile?.stage_name ??
    venueProfile?.name ??
    hostProfile?.full_name ??
    user.email

  const roleLabel = role === 'host' ? 'Event Host' : role ?? 'User'

  return (
    <>
      <Head>
        <title>Dashboard | Band Bridge</title>
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1DB954] rounded-xl flex items-center justify-center">
                {role ? ROLE_ICONS[role] : <Music2 className="w-6 h-6 text-black" />}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{displayName}</h1>
                <span className="inline-flex items-center bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{roleLabel}</span>
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

          {/* ── HOST DASHBOARD ── */}
          {role === 'host' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Event details card */}
                <div className="lg:col-span-2 bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">Your Event</h2>
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-1.5 text-[#1DB954] hover:text-[#1ed760] text-sm font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Event Details
                    </Link>
                  </div>

                  {hostProfile ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                        {hostProfile.city && (
                          <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm">
                            <MapPin className="w-4 h-4 text-[#1DB954]" />
                            {hostProfile.city}, {hostProfile.state}
                          </div>
                        )}
                        {hostProfile.event_type && (
                          <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm">
                            <Calendar className="w-4 h-4 text-[#1DB954]" />
                            {hostProfile.event_type}
                          </div>
                        )}
                        {hostProfile.budget_range && (
                          <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm">
                            <DollarSign className="w-4 h-4 text-[#1DB954]" />
                            {hostProfile.budget_range}
                          </div>
                        )}
                      </div>

                      {hostProfile.event_date && (
                        <div className="bg-[#282828] rounded-xl px-4 py-3 text-sm">
                          <span className="text-[#B3B3B3]">Event Date: </span>
                          <span className="text-white font-medium">
                            {new Date(hostProfile.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {hostProfile.notes && (
                        <div>
                          <p className="text-[#B3B3B3] text-xs uppercase tracking-wider mb-1.5">Notes</p>
                          <p className="text-[#B3B3B3] text-sm leading-relaxed">{hostProfile.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#B3B3B3] text-sm mb-4">Your event details aren&apos;t set up yet.</p>
                      <Link href="/profile/edit" className="bg-[#1DB954] text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-[#1ed760] transition-colors">
                        Add Event Details
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#1DB954]/20">
                    <h3 className="text-white font-bold text-base mb-2">Find Your Musician</h3>
                    <p className="text-[#B3B3B3] text-sm mb-4">Browse available artists and bands. Only 5% booking fee.</p>
                    <Link
                      href="/musicians"
                      className="block w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-center py-3 rounded-full transition-all hover:scale-105 text-sm"
                    >
                      Browse Musicians
                    </Link>
                  </div>

                  <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3">Account</h3>
                    <p className="text-[#B3B3B3] text-xs break-all">{user.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MUSICIAN / VENUE DASHBOARD ── */}
          {role !== 'host' && (
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
                {role === 'musician' && musicianProfile && (
                  <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5">
                    <h3 className="text-white font-bold text-sm mb-3">Availability</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B3B3B3] text-sm">
                        {musicianProfile.is_available ? 'Available for booking' : 'Not available'}
                      </span>
                      <button
                        onClick={toggleAvailability}
                        className={`relative w-11 h-6 rounded-full transition-colors ${musicianProfile.is_available ? 'bg-[#1DB954]' : 'bg-[#282828]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${musicianProfile.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-white font-bold text-sm mb-3">Account</h3>
                  <p className="text-[#B3B3B3] text-xs break-all">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking panels — role-aware */}
          {role === 'musician' && <MusicianBookingsPanel initialTab={initialTab} />}
          {role === 'venue'    && <VenueBookingsPanel    initialTab={initialTab} />}

          {/* Danger Zone */}
          <div className="mt-8 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">Danger Zone</h2>
            <p className="text-[#B3B3B3] text-sm mb-4">
              Permanently delete your account, profile, and all associated data.
            </p>
            <button
              onClick={() => { setShowDeleteModal(true); setConfirmText(''); setDeleteError('') }}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              Delete My Account
            </button>
          </div>

        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-white font-bold text-xl mb-3">Delete Account?</h2>
            <p className="text-[#B3B3B3] text-sm leading-relaxed mb-6">
              This will permanently delete your account, profile, and all associated data. This action cannot be undone.
            </p>

            <div className="mb-6">
              <label className="text-[#B3B3B3] text-sm mb-2 block">
                Type <span className="text-white font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#282828] border border-white/10 text-white placeholder-[#B3B3B3]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>

            {deleteError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 bg-[#282828] hover:bg-[#333] text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all"
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
