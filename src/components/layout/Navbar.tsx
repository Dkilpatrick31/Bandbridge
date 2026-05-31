import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { Music2, Menu, X, Bell, MessageSquare, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/musicians", label: "Find Musicians" },
  { href: "/venues",    label: "Venues" },
  { href: "/how-it-works", label: "How It Works" },
] as const

type Dropdown = 'messages' | 'notifications'

export default function Navbar() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<Dropdown | null>(null)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  function isActive(href: string) {
    return router.pathname === href || router.pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  function toggleDropdown(name: Dropdown) {
    setOpenDropdown(prev => prev === name ? null : name)
  }

  // Click-away closes dropdowns
  useEffect(() => {
    if (!openDropdown) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openDropdown])

  // Fetch unread notification count
  useEffect(() => {
    if (!user) { setUnreadNotifCount(0); return }
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count, error }) => {
        if (!error) setUnreadNotifCount(count ?? 0)
      })
  }, [user])

  const iconBtn = (active: boolean) =>
    `p-2 transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
      active ? 'text-white bg-white/10' : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
    }`

  return (
    <nav
      className="fixed top-0 w-full z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/10"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1DB954] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
              Band<span className="text-[#1DB954]">Bridge</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <Link key={href} href={href}
                  className={`relative text-sm font-medium transition-colors border-b-2 pb-0.5 ${
                    active ? 'text-[#1DB954] border-[#1DB954]' : 'text-[#B3B3B3] hover:text-white border-transparent'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Desktop right side */}
          <div ref={containerRef} className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {firstName && (
                  <span className="text-[#B3B3B3] text-sm font-medium px-2 mr-1">
                    Hi, {firstName}
                  </span>
                )}

                {/* Profile */}
                <Link href="/dashboard" className={iconBtn(isActive('/dashboard'))} title="Dashboard">
                  <User className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('messages')}
                    className={iconBtn(openDropdown === 'messages')}
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  {openDropdown === 'messages' && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/5">
                        <h3 className="text-white font-semibold text-sm">Messages</h3>
                      </div>
                      <div className="py-10 text-center">
                        <MessageSquare className="w-8 h-8 text-[#B3B3B3]/20 mx-auto mb-2" />
                        <p className="text-[#B3B3B3] text-sm">No messages yet</p>
                      </div>
                      <div className="border-t border-white/5 px-4 py-3">
                        <Link
                          href="/messages"
                          onClick={() => setOpenDropdown(null)}
                          className="text-[#1DB954] text-sm font-medium hover:underline"
                        >
                          View All Messages →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('notifications')}
                    className={`${iconBtn(openDropdown === 'notifications')} relative`}
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>

                  {openDropdown === 'notifications' && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        {unreadNotifCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {unreadNotifCount}
                          </span>
                        )}
                      </div>
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 text-[#B3B3B3]/20 mx-auto mb-2" />
                        <p className="text-[#B3B3B3] text-sm">No notifications yet</p>
                      </div>
                      <div className="border-t border-white/5 px-4 py-3">
                        <Link
                          href="/notifications"
                          onClick={() => setOpenDropdown(null)}
                          className="text-[#1DB954] text-sm font-medium hover:underline"
                        >
                          View All →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Log out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 bg-[#1E1E1E] hover:bg-[#282828] border border-white/10 text-[#B3B3B3] hover:text-white text-sm font-medium px-3 py-2 rounded-full transition-all min-h-[44px] ml-1"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium px-4 py-2 min-h-[44px] flex items-center">
                  Log In
                </Link>
                <Link href="/signup" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 min-h-[44px] flex items-center">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden text-white p-2.5 -mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1E1E1E] border-t border-white/10 px-4 py-4 flex flex-col">
          {firstName && user && (
            <div className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5">
              Hi, {firstName}
            </div>
          )}
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`min-h-[44px] flex items-center text-sm font-medium transition-colors border-b border-white/5 last:border-0 ${
                isActive(href) ? 'text-[#1DB954]' : 'text-[#B3B3B3]'
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5">
                Dashboard
              </Link>
              <Link href="/messages" onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5">
                Messages
              </Link>
              <Link href="/notifications" onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between text-[#B3B3B3] text-sm font-medium border-b border-white/5">
                <span>Notifications</span>
                {unreadNotifCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadNotifCount}</span>
                )}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleSignOut() }}
                className="min-h-[44px] flex items-center justify-center bg-[#282828] border border-white/10 text-[#B3B3B3] font-semibold text-sm rounded-xl mt-3"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5">
                Log In
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center bg-[#1DB954] text-black font-bold text-sm rounded-full mt-3">
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
