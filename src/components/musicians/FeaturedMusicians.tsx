import MusicianCard from "./MusicianCard";

// Placeholder musicians — replace with DB data
const FEATURED_MUSICIANS = [
  {
    id: "1",
    stageName: "The Lone Star Band",
    genre: ["COUNTRY", "FOLK"],
    city: "Austin",
    state: "TX",
    isAvailable: true,
    hourlyRate: 250,
    spotifyUrl: "https://open.spotify.com",
  },
  {
    id: "2",
    stageName: "DJ Voltage",
    genre: ["EDM", "DJ"],
    city: "Nashville",
    state: "TN",
    isAvailable: true,
    hourlyRate: 300,
    spotifyUrl: "https://open.spotify.com",
  },
  {
    id: "3",
    stageName: "Rio Verde",
    genre: ["LATIN", "POP"],
    city: "Austin",
    state: "TX",
    isAvailable: false,
    hourlyRate: 200,
  },
  {
    id: "4",
    stageName: "Midnight Theory",
    genre: ["ROCK", "INDIE"],
    city: "Nashville",
    state: "TN",
    isAvailable: true,
    hourlyRate: 350,
    spotifyUrl: "https://open.spotify.com",
  },
  {
    id: "5",
    stageName: "Soulstream",
    genre: ["RNB", "HIP_HOP"],
    city: "Austin",
    state: "TX",
    isAvailable: true,
  },
  {
    id: "6",
    stageName: "The Jazz Collective",
    genre: ["JAZZ", "BLUES"],
    city: "Nashville",
    state: "TN",
    isAvailable: true,
    hourlyRate: 275,
    spotifyUrl: "https://open.spotify.com",
  },
];

export default function FeaturedMusicians() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">Featured Artists</h2>
            <p className="text-[#B3B3B3] text-lg">Ready to play your venue.</p>
          </div>
          <a href="/musicians" className="hidden sm:block text-[#1DB954] hover:text-[#1ed760] font-semibold text-sm transition-colors">
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_MUSICIANS.map((musician) => (
            <MusicianCard key={musician.id} {...musician} />
          ))}
        </div>
      </div>
    </section>
  );
}
