# 🎸 BandBridge

> Connecting independent musicians and bands with venues. Only 5% booking fee.

## Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe Connect (5% platform fee)
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values

# Run dev server
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── musicians/            # Browse & profile pages
│   ├── venues/               # Venue pages
│   ├── onboarding/           # Signup flow
│   ├── dashboard/            # User dashboard
│   └── api/                  # API routes
├── components/
│   ├── layout/               # Navbar, Footer, Hero, etc.
│   ├── musicians/            # MusicianCard, GenreBrowser, etc.
│   ├── venues/               # Venue components
│   └── booking/              # Booking flow components
├── lib/                      # Utilities, db client
├── types/                    # TypeScript types
└── hooks/                    # Custom React hooks
```

## Roadmap
- [ ] Auth (NextAuth + Stripe Connect onboarding)
- [ ] Musician profiles with Spotify + YouTube embeds
- [ ] Venue profiles
- [ ] Booking request flow
- [ ] Stripe payment processing (5% fee)
- [ ] Dashboard for musicians and venues
- [ ] Search + filter by genre, city, availability
- [ ] Mobile app (React Native / Expo)
