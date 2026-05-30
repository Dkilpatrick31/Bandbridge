import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1DB954]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Zap className="w-3 h-3" />
          Only 5% Booking Fee — Industry lowest
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
          Your music deserves<br />
          <span className="text-[#1DB954]">a bigger stage.</span>
        </h1>

        <p className="text-[#B3B3B3] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          BandBridge connects independent musicians and bands with venues across Austin, Nashville, and beyond. No bloated booking agents. Just music.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="group flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#1DB954]/25"
          >
            Get Listed Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/musicians"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-4 rounded-full transition-all border border-white/20 hover:border-white/40"
          >
            Browse Musicians
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "5%", label: "Booking Fee" },
            { value: "10–20%", label: "Industry Avg" },
            { value: "100%", label: "Artist First" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#1DB954]">{stat.value}</div>
              <div className="text-[#B3B3B3] text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
