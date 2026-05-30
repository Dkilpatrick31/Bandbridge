import Link from "next/link";
import { MapPin, Music, ExternalLink } from "lucide-react";

export interface MusicianCardProps {
  id: string;
  stageName: string;
  genre: string[];
  city: string;
  state: string;
  profileImage?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  isAvailable: boolean;
  hourlyRate?: number;
}

export default function MusicianCard({
  id,
  stageName,
  genre,
  city,
  state,
  profileImage,
  spotifyUrl,
  isAvailable,
  hourlyRate,
}: MusicianCardProps) {
  return (
    <Link href={`/musicians/${id}`} className="group block">
      <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/5 hover:border-[#1DB954]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1DB954]/10">
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-[#282828] to-[#1E1E1E] overflow-hidden">
          {profileImage ? (
            <img src={profileImage} alt={stageName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-16 h-16 text-[#1DB954]/30" />
            </div>
          )}
          {/* Availability badge */}
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isAvailable ? "bg-[#1DB954] text-black" : "bg-[#B3B3B3]/20 text-[#B3B3B3]"}`}>
            {isAvailable ? "Available" : "Booked"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#1DB954] transition-colors truncate">{stageName}</h3>

          <div className="flex items-center gap-1.5 text-[#B3B3B3] text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{city}, {state}</span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {genre.slice(0, 3).map((g) => (
              <span key={g} className="bg-[#282828] text-[#B3B3B3] text-xs px-2.5 py-1 rounded-full border border-white/5">
                {g.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {hourlyRate ? (
              <span className="text-[#1DB954] font-semibold text-sm">${hourlyRate}/hr</span>
            ) : (
              <span className="text-[#B3B3B3] text-sm">Contact for rate</span>
            )}
            {spotifyUrl && (
              <div className="flex items-center gap-1 text-[#1DB954] text-xs font-medium">
                <ExternalLink className="w-3 h-3" />
                Spotify
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
