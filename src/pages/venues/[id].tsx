import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MapPin, Users, Globe, Phone, Mail, Building2 } from 'lucide-react'

interface VenueDetail {
  id: string
  name: string
  bio: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  capacity: number
  genres: string[]
  websiteUrl?: string
  phone?: string
  email?: string
  showEmail: boolean
  showPhone: boolean
}

const VENUES: Record<string, VenueDetail> = {
  "1": {
    id: "1",
    name: "The Parish",
    bio: "Legendary multi-level venue on 6th Street with a reputation for breaking emerging acts. The Parish has hosted everyone from local Austin favorites to internationally touring artists. Our intimate 500-cap room delivers an unbeatable connection between performer and crowd, with a top-tier sound system and experienced production staff.",
    streetAddress: "214 E 6th St",
    city: "Austin", state: "TX", zipCode: "78701",
    capacity: 500,
    genres: ["Rock", "Indie", "Alternative"],
    websiteUrl: "https://theparish.com",
    phone: "(512) 478-6372",
    email: "booking@theparish.com",
    showEmail: true, showPhone: true,
  },
  "2": {
    id: "2",
    name: "Stubb's Waller Creek",
    bio: "Iconic outdoor amphitheater set against Austin's downtown skyline. Named after legendary pitmaster C.B. 'Stubb' Stubblefield, this world-class venue has hosted legends like Willie Nelson, Radiohead, and Foo Fighters. Our outdoor stage seats 2,750 and our indoor arena holds up to 1,800 — making us the premier destination for mid-to-large acts in the Southwest.",
    streetAddress: "801 Red River St",
    city: "Austin", state: "TX", zipCode: "78701",
    capacity: 2750,
    genres: ["Country", "Rock", "Blues"],
    websiteUrl: "https://stubbsaustin.com",
    email: "booking@stubbsaustin.com",
    showEmail: true, showPhone: false,
  },
  "3": {
    id: "3",
    name: "Antone's Nightclub",
    bio: "Austin's home of the blues since 1975. Founded by Clifford Antone, this venue launched the careers of Stevie Ray Vaughan and countless others. We book world-class blues, jazz, and R&B acts seven nights a week. Our 400-cap room offers an intimate setting with legendary acoustics and a dedicated local following.",
    streetAddress: "305 E 5th St",
    city: "Austin", state: "TX", zipCode: "78701",
    capacity: 400,
    genres: ["Blues", "Jazz", "R&B"],
    websiteUrl: "https://antonesnightclub.com",
    phone: "(512) 814-0361",
    email: "info@antonesnightclub.com",
    showEmail: true, showPhone: true,
  },
  "4": {
    id: "4",
    name: "The Continental Club",
    bio: "A true Austin institution. Nightly live music in a classic honky-tonk atmosphere since 1955. The Continental Club is where generations of Austinites have come to dance, drink, and discover new music. We feature rockabilly, country, and blues every single night — no excuses, no off nights.",
    streetAddress: "1315 S Congress Ave",
    city: "Austin", state: "TX", zipCode: "78704",
    capacity: 200,
    genres: ["Rockabilly", "Country", "Blues"],
    websiteUrl: "https://continentalclub.com",
    phone: "(512) 441-2444",
    email: "booking@continentalclub.com",
    showEmail: true, showPhone: true,
  },
  "5": {
    id: "5",
    name: "The Bluebird Cafe",
    bio: "The most famous songwriter showcase room in the world. The Bluebird Cafe is where country music legends are discovered — Taylor Swift, Garth Brooks, and Katy Perry all have Bluebird connections. Our intimate 100-seat room is dedicated to the craft of songwriting, featuring in-the-round performances that put the music front and center.",
    streetAddress: "4104 Hillsboro Pike",
    city: "Nashville", state: "TN", zipCode: "37215",
    capacity: 100,
    genres: ["Country", "Folk", "Singer-Songwriter"],
    websiteUrl: "https://bluebirdcafe.com",
    email: "info@bluebirdcafe.com",
    showEmail: true, showPhone: false,
  },
  "6": {
    id: "6",
    name: "Ryman Auditorium",
    bio: "The Mother Church of Country Music. A National Historic Landmark with unparalleled acoustics and a history that spans over 130 years. The Ryman has hosted everyone from Hank Williams to Jack White. Our 2,362-seat venue offers a once-in-a-career performance opportunity for artists ready for the biggest stage in Nashville.",
    streetAddress: "116 5th Ave N",
    city: "Nashville", state: "TN", zipCode: "37219",
    capacity: 2362,
    genres: ["Country", "Bluegrass", "Gospel"],
    websiteUrl: "https://ryman.com",
    email: "booking@ryman.com",
    showEmail: true, showPhone: false,
  },
  "7": {
    id: "7",
    name: "3rd and Lindsley",
    bio: "Nashville's premier bar and grill for live original music. Seven nights a week of top-tier local and touring acts spanning rock, blues, and country. Our 300-cap room has a full kitchen, full bar, and a sound system built for serious artists. We've been championing original music in Nashville since 1992.",
    streetAddress: "818 3rd Ave S",
    city: "Nashville", state: "TN", zipCode: "37210",
    capacity: 300,
    genres: ["Rock", "Blues", "Country"],
    websiteUrl: "https://3rdandlindsley.com",
    phone: "(615) 259-9891",
    email: "booking@3rdandlindsley.com",
    showEmail: true, showPhone: true,
  },
  "8": {
    id: "8",
    name: "Exit/In",
    bio: "Nashville's longest-running independent music venue, launching careers since 1971. Exit/In has been the proving ground for artists like Jimmy Buffett, Emmylou Harris, and The Replacements. Our 500-cap room is dedicated to independent and touring artists who play real music for real fans.",
    streetAddress: "2208 Elliston Pl",
    city: "Nashville", state: "TN", zipCode: "37203",
    capacity: 500,
    genres: ["Indie", "Rock", "Alternative"],
    websiteUrl: "https://exitin.com",
    phone: "(615) 321-3340",
    email: "booking@exitin.com",
    showEmail: true, showPhone: true,
  },
}

const FALLBACK = VENUES["1"]

export default function VenueProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const venue = (typeof id === 'string' && VENUES[id]) ? VENUES[id] : FALLBACK

  const hasContact = (venue.showEmail && venue.email) || (venue.showPhone && venue.phone)

  return (
    <>
      <Head>
        <title>{venue.name} | Band Bridge</title>
        <meta name="description" content={venue.bio.slice(0, 155)} />
      </Head>
      <div className="min-h-screen bg-[#121212] pt-20 sm:pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link href="/venues" className="text-[#B3B3B3] hover:text-white text-sm mb-6 sm:mb-8 inline-flex items-center gap-1.5 transition-colors min-h-[44px]">
            ← Back to Venues
          </Link>

          {/* Hero card */}
          <div className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-8 border border-white/5 mb-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#1DB954]/30 to-[#282828] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 sm:w-14 sm:h-14 text-[#1DB954]/50" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white truncate">{venue.name}</h1>
                    <div className="flex items-start gap-1.5 text-[#B3B3B3] text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1DB954] flex-shrink-0 mt-0.5" />
                      <span className="break-words">{venue.streetAddress}, {venue.city}, {venue.state} {venue.zipCode}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 flex items-center gap-1.5 bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] px-3 py-1.5 rounded-full text-sm font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {venue.capacity.toLocaleString()} cap
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.genres.map(g => (
                    <span key={g} className="bg-[#282828] text-[#B3B3B3] text-xs px-3 py-1 rounded-full border border-white/5">
                      {g}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                  <div>
                    <div className="text-[#1DB954] font-bold text-lg sm:text-xl">{venue.capacity.toLocaleString()}</div>
                    <div className="text-[#B3B3B3] text-xs">Capacity</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg sm:text-xl">{venue.genres.length}</div>
                    <div className="text-[#B3B3B3] text-xs">Genre Types</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-3">About</h2>
                <p className="text-[#B3B3B3] leading-relaxed text-sm sm:text-base">{venue.bio}</p>
              </div>

              {/* Preferred genres */}
              <div className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-6 border border-white/5">
                <h2 className="text-white font-bold text-lg mb-4">Preferred Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {venue.genres.map(g => (
                    <span key={g} className="bg-[#282828] border border-[#1DB954]/20 text-[#1DB954] text-sm px-4 py-1.5 rounded-full font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              {hasContact && (
                <div className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-6 border border-white/5">
                  <h2 className="text-white font-bold text-lg mb-4">Contact</h2>
                  <div className="space-y-3">
                    {venue.showEmail && venue.email && (
                      <a href={`mailto:${venue.email}`} className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm group">
                        <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#1DB954]/10 transition-colors">
                          <Mail className="w-4 h-4 text-[#1DB954]" />
                        </div>
                        {venue.email}
                      </a>
                    )}
                    {venue.showPhone && venue.phone && (
                      <a href={`tel:${venue.phone}`} className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm group">
                        <div className="w-8 h-8 bg-[#282828] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#1DB954]/10 transition-colors">
                          <Phone className="w-4 h-4 text-[#1DB954]" />
                        </div>
                        {venue.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Book a Musician CTA */}
              <div className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-6 border border-[#1DB954]/20 lg:sticky lg:top-24">
                <h3 className="text-white font-bold text-lg mb-2">Looking for Artists?</h3>
                <p className="text-[#B3B3B3] text-sm mb-5">Browse available musicians and bands ready to perform at your venue. Only 5% booking fee.</p>
                <Link
                  href="/musicians"
                  className="block w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-center py-3 rounded-xl transition-all hover:scale-105 text-sm"
                >
                  Book a Musician
                </Link>
                <p className="text-[#B3B3B3] text-xs text-center mt-3">5% platform fee. Secure payment via Stripe.</p>
              </div>

              {/* Links */}
              <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-white/5 space-y-3">
                {venue.websiteUrl && (
                  <a href={venue.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm">
                    <Globe className="w-4 h-4 text-[#1DB954]" />
                    Website
                    <span className="ml-auto text-xs">↗</span>
                  </a>
                )}
                {venue.showEmail && venue.email && (
                  <a href={`mailto:${venue.email}`}
                    className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm">
                    <Mail className="w-4 h-4 text-[#1DB954]" />
                    Email Venue
                  </a>
                )}
                {venue.showPhone && venue.phone && (
                  <a href={`tel:${venue.phone}`}
                    className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors text-sm">
                    <Phone className="w-4 h-4 text-[#1DB954]" />
                    {venue.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
