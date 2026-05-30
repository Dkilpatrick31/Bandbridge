import Head from 'next/head'
import HeroSection from '@/components/layout/HeroSection'
import HowItWorks from '@/components/layout/HowItWorks'
import GenreBrowser from '@/components/musicians/GenreBrowser'
import FeaturedMusicians from '@/components/musicians/FeaturedMusicians'
import CTASection from '@/components/layout/CTASection'

export default function Home() {
  return (
    <>
      <Head>
        <title>Band Bridge | Connect Musicians with Venues</title>
        <meta name="description" content="The easiest way for independent musicians and bands to get booked. Only 5% booking fee." />
        <meta name="keywords" content="musicians, venues, booking, live music, bands, Austin, Nashville" />
      </Head>
      <HeroSection />
      <HowItWorks />
      <GenreBrowser />
      <FeaturedMusicians />
      <CTASection />
    </>
  )
}
