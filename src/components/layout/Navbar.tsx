import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/musicians", label: "Find Musicians" },
  { href: "/venues",    label: "Venues" },
  { href: "/how-it-works", label: "How It Works" },
] as const

export default function Navbar() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href: string) {
    return router.pathname === href || router.pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="BandBridge"
              className="h-7 sm:h-8 w-auto group-hover:scale-110 transition-transform"
            />
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
              Band<span className="text-[#1DB954]">Bridge</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative text-sm font-medium transition-colors border-b-2 pb-0.5 ${
                    active
                      ? 'text-[#1DB954] border-[#1DB954]'
                      : 'text-[#B3B3B3] hover:text-white border-transparent'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium px-4 py-2 min-h-[44px]">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 bg-[#1E1E1E] hover:bg-[#282828] border border-white/10 text-[#B3B3B3] hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-all min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium px-4 py-2 min-h-[44px] flex items-center">Log In</Link>
                <Link href="/signup" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-sm px-5 py-2.5 rounded-full transition-all hover:scale-105 min-h-[44px] flex items-center">Get Listed</Link>
              </>
            )}
          </div>

          {/* Hamburger — 44×44 tap target */}
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
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`min-h-[44px] flex items-center text-sm font-medium transition-colors border-b border-white/5 last:border-0 ${
                isActive(href) ? 'text-[#1DB954]' : 'text-[#B3B3B3]'
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
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
              <Link
                href="/login"
                className="min-h-[44px] flex items-center text-[#B3B3B3] text-sm font-medium border-b border-white/5"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="min-h-[44px] flex items-center justify-center bg-[#1DB954] text-black font-bold text-sm rounded-full mt-3"
                onClick={() => setMenuOpen(false)}
              >
                Get Listed
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
