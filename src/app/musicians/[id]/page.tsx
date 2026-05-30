import { MapPin, Globe, Calendar, Music, ExternalLink, Play } from "lucide-react";
import Link from "next/link";

// Placeholder — will be replaced with DB fetch
const MUSICIAN = {
  id: "1",
  stageName: "The Lone Star Band",
  bio: "Austin-based country and folk outfit bringing authentic Texas sounds to every stage. With over 200 shows across the Lone Star State, we know how to read a room and keep a crowd moving all night long.",
  genre: ["COUNTRY", "FOLK"],
  city: "Austin",
  state: "TX",
  hourlyRate: 250,
  isAvailable: true,
  websiteUrl: "https://example.com",
  spotifyUrl: "https://open.spotify.com/embed/artist/example",
  youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  members: 4,
  yearsActive: 6,
};

export default function MusicianProfilePage() {
  return (
    <div className="min-h-screen bg-[#121212] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/musicians" className="text-[#B3B3B3] hover:text-white text-sm mb-8 inline-flex items-center gap-1.5 transition-colors">
          ← Back to Musicians
        </Link>

        {/* Profile Header */}
        <div className="bg-[#1E1E1E] rounded-2xl p-8 border border-white/5 mb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#1DB954]/30 to-[#282828] flex items-center justify-center flex-shrink-0">
              <Music className="w-14 h-14 text-[#1DB954]/50" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white">{MUSICIAN.stageName}</h1>
                  <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {MUSICIAN.city}, {MUSICIAN.state}
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${MUSICIAN.isAvailable ? "bg-[#1DB954] text-black" : "bg-white/10 text-[#B3B3B3]"}`}>
                  {MUSICIAN.isAvailable ? "Available for Booking" : "Currently Booked"}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {MUSICIAN.genre.map((g) => (
                  <span key={g} className="bg-[#282828] text-[#B3B3B3] text-xs px-3 py-1 rounded-full border border-white/5">
                    {g.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-[#1DB954] font-bold text-xl">${MUSICIAN.hourlyRate}/hr</div>
                  <div className="text-[#B3B3B3] text-xs">Booking Rate</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">{MUSICIAN.members}</div>
                  <div className="text-[#B3B3B3] text-xs">Members</div>
                </div>
                <div>
                  <div className="text-white font-bold text-xl">{MUSICIAN.yearsActive} yrs</div>
                  <div className="text-[#B3B3B3] text-xs">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Media */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
              <h2 className="text-white font-bold text-lg mb-3">About</h2>
              <p className="text-[#B3B3B3] leading-relaxed">{MUSICIAN.bio}</p>
            </div>

            {/* YouTube */}
            {MUSICIAN.youtubeUrl && (
              <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#1DB954]" /> Live Performance
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={MUSICIAN.youtubeUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Spotify */}
            {MUSICIAN.spotifyUrl && (
              <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4">Listen on Spotify</h2>
                <iframe
                  src={MUSICIAN.spotifyUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-4">
            {/* Book Now Card */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#1DB954]/20 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-2">Book This Artist</h3>
              <p className="text-[#B3B3B3] text-sm mb-5">5% platform fee. Secure payment via Stripe.</p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-[#B3B3B3] text-xs mb-1 block">Event Date</label>
                  <input type="date" className="w-full bg-[#282828] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]/50" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#B3B3B3] text-xs mb-1 block">Start</label>
                    <input type="time" className="w-full bg-[#282828] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]/50" />
                  </div>
                  <div>
                    <label className="text-[#B3B3B3] text-xs mb-1 block">End</label>
                    <input type="time" className="w-full bg-[#282828] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]/50" />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-5">
                <div className="flex justify-between text-sm text-[#B3B3B3] mb-1">
                  <span>Artist rate</span>
                  <span>${MUSICIAN.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-sm text-[#B3B3B3] mb-1">
                  <span>Platform fee (5%)</span>
                  <span>~${(MUSICIAN.hourlyRate! * 0.05).toFixed(2)}/hr</span>
                </div>
              </div>

              <Link
                href="/login?redirect=booking"
                className="block w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-center py-3 rounded-xl transition-all hover:scale-105"
              >
                Request Booking
              </Link>
              <p className="text-[#B3B3B3] text-xs text-center mt-3">You'll need an account to book.</p>
            </div>

            {/* Links */}
            <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5 space-y-3">
              {MUSICIAN.websiteUrl && (
                <a href={MUSICIAN.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm">
                  <Globe className="w-4 h-4 text-[#1DB954]" />
                  Website
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
              {MUSICIAN.spotifyUrl && (
                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm">
                  <Music className="w-4 h-4 text-[#1DB954]" />
                  Spotify
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              )}
              <div className="flex items-center gap-3 text-[#B3B3B3] text-sm">
                <Calendar className="w-4 h-4 text-[#1DB954]" />
                Responds within 24hrs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
