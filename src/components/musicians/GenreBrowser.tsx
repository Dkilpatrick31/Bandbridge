"use client";
import Link from "next/link";
import { useState } from "react";

const genres = [
  { name: "All", slug: "all", emoji: "🎵" },
  { name: "Country", slug: "country", emoji: "🤠" },
  { name: "Rock", slug: "rock", emoji: "🎸" },
  { name: "Hip Hop", slug: "hip-hop", emoji: "🎤" },
  { name: "EDM", slug: "edm", emoji: "🎛️" },
  { name: "DJ", slug: "dj", emoji: "🎧" },
  { name: "Jazz", slug: "jazz", emoji: "🎷" },
  { name: "Blues", slug: "blues", emoji: "🎺" },
  { name: "Pop", slug: "pop", emoji: "⭐" },
  { name: "R&B", slug: "rnb", emoji: "🎶" },
  { name: "Folk", slug: "folk", emoji: "🪕" },
  { name: "Metal", slug: "metal", emoji: "🤘" },
  { name: "Latin", slug: "latin", emoji: "💃" },
  { name: "Indie", slug: "indie", emoji: "🌟" },
  { name: "Classical", slug: "classical", emoji: "🎻" },
];

export default function GenreBrowser() {
  const [active, setActive] = useState("all");

  return (
    <section className="py-24 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Browse by Genre</h2>
          <p className="text-[#B3B3B3] text-lg">Find exactly the sound your venue needs.</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {genres.map((genre) => (
            <button
              key={genre.slug}
              onClick={() => setActive(genre.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                active === genre.slug
                  ? "bg-[#1DB954] text-black scale-105"
                  : "bg-[#1E1E1E] text-[#B3B3B3] hover:bg-[#282828] hover:text-white border border-white/10"
              }`}
            >
              <span>{genre.emoji}</span>
              {genre.name}
            </button>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/musicians${active !== "all" ? `?genre=${active}` : ""}`}
            className="inline-flex items-center gap-2 bg-[#1E1E1E] hover:bg-[#282828] text-white font-semibold px-8 py-3 rounded-full border border-white/10 hover:border-[#1DB954]/50 transition-all"
          >
            View All {active !== "all" ? genres.find(g => g.slug === active)?.name : ""} Musicians →
          </Link>
        </div>
      </div>
    </section>
  );
}
