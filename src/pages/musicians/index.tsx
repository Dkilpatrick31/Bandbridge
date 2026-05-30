import Head from 'next/head'
import MusicianCard from '@/components/musicians/MusicianCard'
import { Search, SlidersHorizontal } from 'lucide-react'

const ALL_MUSICIANS = [
  { id: "1", stageName: "The Lone Star Band", genre: ["COUNTRY", "FOLK"], city: "Austin", state: "TX", isAvailable: true, hourlyRate: 250, spotifyUrl: "https://open.spotify.com" },
  { id: "2", stageName: "DJ Voltage", genre: ["EDM", "DJ"], city: "Nashville", state: "TN", isAvailable: true, hourlyRate: 300, spotifyUrl: "https://open.spotify.com" },
  { id: "3", stageName: "Rio Verde", genre: ["LATIN", "POP"], city: "Austin", state: "TX", isAvailable: false, hourlyRate: 200 },
  { id: "4", stageName: "Midnight Theory", genre: ["ROCK", "INDIE"], city: "Nashville", state: "TN", isAvailable: true, hourlyRate: 350, spotifyUrl: "https://open.spotify.com" },
  { id: "5", stageName: "Soulstream", genre: ["RNB", "HIP_HOP"], city: "Austin", state: "TX", isAvailable: true },
  { id: "6", stageName: "The Jazz Collective", genre: ["JAZZ", "BLUES"], city: "Nashville", state: "TN", isAvailable: true, hourlyRate: 275, spotifyUrl: "https://open.spotify.com" },
  { id: "7", stageName: "Steel Canyon", genre: ["COUNTRY", "ROCK"], city: "Austin", state: "TX", isAvailable: true, hourlyRate: 225 },
  { id: "8", stageName: "Neon Pulse", genre: ["EDM", "POP"], city: "Austin", state: "TX", isAvailable: true, hourlyRate: 400, spotifyUrl: "https://open.spotify.com" },
  { id: "9", stageName: "Blue Smoke", genre: ["BLUES", "JAZZ"], city: "Nashville", state: "TN", isAvailable: false, hourlyRate: 175 },
]

export default function MusiciansPage() {
  return (
    <>
      <Head>
        <title>Find Musicians | Band Bridge</title>
        <meta name="description" content="Browse available artists and bands ready to play your venue." />
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Find Musicians</h1>
            <p className="text-[#B3B3B3] text-lg">Browse available artists and bands ready to play your venue.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
              <input
                type="text"
                placeholder="Search by name, genre, or city..."
                className="w-full bg-[#1E1E1E] border border-white/10 text-white placeholder-[#B3B3B3] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
              />
            </div>
            <button className="flex items-center gap-2 bg-[#1E1E1E] border border-white/10 text-[#B3B3B3] hover:text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_MUSICIANS.map((musician) => (
              <MusicianCard key={musician.id} {...musician} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
