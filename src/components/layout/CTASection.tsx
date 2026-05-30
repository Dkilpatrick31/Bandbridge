import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-16 sm:py-24 bg-[#121212]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-[#1DB954]/20 to-[#1DB954]/5 border border-[#1DB954]/20 rounded-3xl p-8 sm:p-12 md:p-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Ready to bridge the gap?
          </h2>
          <p className="text-[#B3B3B3] text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
            Whether you&apos;re a musician looking for more gigs or a venue needing the right sound — BandBridge has you covered.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#1DB954]/25 min-h-[52px]"
            >
              I&apos;m a Musician
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-4 rounded-full transition-all border border-white/20 min-h-[52px]"
            >
              I&apos;m a Venue
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
