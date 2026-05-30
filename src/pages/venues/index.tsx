import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Search, MapPin, Users } from 'lucide-react'

interface Venue {
  id: string
  name: string
  city: string
  state: string
  capacity: number
  genres: string[]
  bio: string
}

const ALL_VENUES: Venue[] = [
  {
    id: "1",
    name: "The Parish",
    city: "Austin", state: "TX", capacity: 500,
    genres: ["Rock", "Indie", "Alternative"],
    bio: "Legendary multi-level venue on 6th Street with a reputation for breaking emerging acts.",
  },
  {
    id: "2",
    name: "Stubb's Waller Creek",
    city: "Austin", state: "TX", capacity: 2750,
    genres: ["Country", "Rock", "Blues"],
    bio: "Iconic outdoor amphitheater set against Austin's downtown skyline. One of the top live music venues in the country.",
  },
  {
    id: "3",
    name: "Antone's Nightclub",
    city: "Austin", state: "TX", capacity: 400,
    genres: ["Blues", "Jazz", "R&B"],
    bio: "Austin's home of the blues since 1975. World-class acts play this intimate room every week.",
  },
  {
    id: "4",
    name: "The Continental Club",
    city: "Austin", state: "TX", capacity: 200,
    genres: ["Rockabilly", "Country", "Blues"],
    bio: "A true Austin institution. Nightly live music in a classic honky-tonk atmosphere since 1955.",
  },
  {
    id: "5",
    name: "The Bluebird Cafe",
    city: "Nashville", state: "TN", capacity: 100,
    genres: ["Country", "Folk", "Singer-Songwriter"],
    bio: "The most famous songwriter showcase room in the world. Where country music legends are discovered.",
  },
  {
    id: "6",
    name: "Ryman Auditorium",
    city: "Nashville", state: "TN", capacity: 2362,
    genres: ["Country", "Bluegrass", "Gospel"],
    bio: "The Mother Church of Country Music. A National Historic Landmark with unparalleled acoustics.",
  },
  {
    id: "7",
    name: "3rd and Lindsley",
    city: "Nashville", state: "TN", capacity: 300,
    genres: ["Rock", "Blues", "Country"],
    bio: "Nashville's premier bar and grill for live original music. Seven nights a week of top-tier local and touring acts.",
  },
  {
    id: "8",
    name: "Exit/In",
    city: "Nashville", state: "TN", capacity: 500,
    genres: ["Indie", "Rock", "Alternative"],
    bio: "Nashville's longest-running independent music venue. Launching careers since 1971.",
  },
]

const CITY_FILTERS = ['All', 'Austin', 'Nashville', 'Other'] as const
type CityFilter = typeof CITY_FILTERS[number]

export default function VenuesPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<CityFilter>('All')

  const filtered = ALL_VENUES.filter(v => {
    const matchesCity =
      cityFilter === 'All' ? true :
      cityFilter === 'Other' ? v.city !== 'Austin' && v.city !== 'Nashville' :
      v.city === cityFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) ||
      v.genres.some(g => g.toLowerCase().includes(q))
    return matchesCity && matchesSearch
  })

  return (
    <>
      <Head>
        <title>Find Venues | BandBridge</title>
        <meta name="description" content="Browse venues looking for live music across Austin, Nashville, and beyond." />
        <meta property="og:title" content="Find Venues | BandBridge" />
        <meta property="og:description" content="Browse venues looking for live music across Austin, Nashville, and beyond." />
      </Head>
      <div className="min-h-screen bg-[#121212] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Find the Perfect Venue</h1>
            <p className="text-[#B3B3B3] text-lg">Browse venues looking for live music across Austin, Nashville, and beyond.</p>
          </div>

          {/* Search */}
          <div className="flex-1 relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, genre, or city..."
              className="w-full bg-[#1E1E1E] border border-white/10 text-white placeholder-[#B3B3B3] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#1DB954]/50"
            />
          </div>

          {/* City filter */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {CITY_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setCityFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  cityFilter === f
                    ? 'bg-[#1DB954] border-[#1DB954] text-black'
                    : 'bg-[#1E1E1E] border-white/10 text-[#B3B3B3] hover:border-white/30 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(venue => (
                <div key={venue.id} className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/5 hover:border-[#1DB954]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1DB954]/10 flex flex-col">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-[#282828] to-[#1E1E1E] flex items-center justify-center">
                    <Users className="w-14 h-14 text-[#1DB954]/30" />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 truncate">{venue.name}</h3>

                    <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm mb-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#1DB954]" />
                      {venue.city}, {venue.state}
                    </div>

                    <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm mb-3">
                      <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#1DB954]" />
                      Capacity: {venue.capacity.toLocaleString()}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {venue.genres.map(g => (
                        <span key={g} className="bg-[#282828] text-[#B3B3B3] text-xs px-2.5 py-1 rounded-full border border-white/5">
                          {g}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/5">
                      <Link
                        href={`/venues/${venue.id}`}
                        className="block w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-center text-sm py-2.5 rounded-full transition-all hover:scale-105"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#B3B3B3] text-lg">No venues found matching your search.</p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
