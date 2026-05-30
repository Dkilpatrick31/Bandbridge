import Link from "next/link";
import { Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1DB954] rounded-lg flex items-center justify-center">
                <Music2 className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-bold text-xl">Band<span className="text-[#1DB954]">Bridge</span></span>
            </Link>
            <p className="text-[#B3B3B3] text-sm leading-relaxed max-w-sm">
              Connecting independent musicians with venues. Only 5% booking fee — because artists deserve more.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Musicians</h4>
            <ul className="space-y-1">
              <li><Link href="/signup" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">Get Listed</Link></li>
              <li><Link href="/dashboard" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">Dashboard</Link></li>
              <li><Link href="/how-it-works" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Venues</h4>
            <ul className="space-y-1">
              <li><Link href="/musicians" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">Browse Musicians</Link></li>
              <li><Link href="/signup" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">List Your Venue</Link></li>
              <li><Link href="/venues" className="text-[#B3B3B3] hover:text-[#1DB954] text-sm transition-colors min-h-[44px] flex items-center py-1">Book a Show</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#B3B3B3] text-xs">© 2026 BandBridge. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[#B3B3B3] hover:text-white text-xs transition-colors min-h-[44px] flex items-center">Terms</Link>
            <Link href="/privacy" className="text-[#B3B3B3] hover:text-white text-xs transition-colors min-h-[44px] flex items-center">Privacy</Link>
            <Link href="/contact" className="text-[#B3B3B3] hover:text-white text-xs transition-colors min-h-[44px] flex items-center">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
