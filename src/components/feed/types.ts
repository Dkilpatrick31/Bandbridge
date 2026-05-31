export interface FeedMusician {
  id: string
  stage_name: string | null
  bio: string | null
  genre: string[] | null
  city: string | null
  state: string | null
  hourly_rate: number | null
  spotify_url: string | null
  youtube_url: string | null
  profile_image: string | null
  is_available: boolean | null
}

export interface FeedVenue {
  id: string
  name: string | null
  bio: string | null
  city: string | null
  state: string | null
  capacity: number | null
  profile_image: string | null
}

export interface HeroProfile {
  id: string
  name: string
  bio: string | null
  genre: string[] | null
  city: string | null
  state: string | null
  type: 'musician' | 'venue'
  profile_image: string | null
  is_available?: boolean | null
  hourly_rate?: number | null
}

export interface FeedData {
  featured: {
    musicians: FeedMusician[]
    venues: FeedVenue[]
  }
  musicians: {
    all: FeedMusician[]
    nearYou: FeedMusician[]
    withMedia: FeedMusician[]
    trending: FeedMusician[]
  }
  venues: {
    all: FeedVenue[]
    nearYou: FeedVenue[]
    trending: FeedVenue[]
  }
}

// Genre → accent color
export const GENRE_COLORS: Record<string, string> = {
  'all':        '#1DB954',
  'edm':        '#00D4FF',
  'hip-hop':    '#FF6B6B',
  'hip_hop':    '#FF6B6B',
  'rnb':        '#E91E8C',
  'r&b':        '#E91E8C',
  'jazz':       '#9B59B6',
  'country':    '#F5A623',
  'rock':       '#FF4500',
  'pop':        '#FF69B4',
  'blues':      '#4169E1',
  'latin':      '#FF8C00',
  'folk':       '#8FBC8F',
  'indie':      '#DDA0DD',
  'classical':  '#DAA520',
}

export function normalizeGenre(g: string): string {
  return g.toLowerCase().replace(/[_\s]+/g, '-')
}

export function getGenreColor(genre: string | null | undefined): string {
  if (!genre) return '#1DB954'
  return GENRE_COLORS[normalizeGenre(genre)] ?? '#1DB954'
}

export function getGenreColorForArray(genres: string[] | null | undefined): string {
  if (!genres || genres.length === 0) return '#1DB954'
  return getGenreColor(genres[0])
}

export function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

export const GENRE_LABELS = [
  'All', 'Rock', 'Pop', 'Country', 'Jazz', 'Blues',
  'R&B', 'Hip-Hop', 'EDM', 'Latin', 'Folk', 'Indie', 'Classical',
]
