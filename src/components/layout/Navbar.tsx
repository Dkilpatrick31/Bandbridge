"use client";
import Link from "next/link";
import { useState } from "react";
import { Music2, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#1DB954] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music2 className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Band<span className="text-[#1DB954]">Bridge</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/musicians" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium">Find Musicians</Link>
            <Link href="/venues" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium">Venues</Link>
            <Link href="/how-it-works" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium">How It Works</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium px-4 py-2">Log In</Link>
            <Link href="/onboarding" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-sm px-5 py-2 rounded-full transition-all hover:scale-105">Get Listed</Link>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#1E1E1E] border-t border-white/10 px-4 py-6 flex flex-col gap-4">
          <Link href="/musicians" className="text-[#B3B3B3] hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>Find Musicians</Link>
          <Link href="/venues" className="text-[#B3B3B3] hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>Venues</Link>
          <Link href="/how-it-works" className="text-[#B3B3B3] hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/login" className="text-[#B3B3B3] hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>Log In</Link>
          <Link href="/onboarding" className="bg-[#1DB954] text-black font-semibold text-sm px-5 py-2 rounded-full text-center" onClick={() => setMenuOpen(false)}>Get Listed</Link>
        </div>
      )}
    </nav>
  );
}
