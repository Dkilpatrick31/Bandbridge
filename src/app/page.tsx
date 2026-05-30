import HeroSection from "@/components/layout/HeroSection";
import GenreBrowser from "@/components/musicians/GenreBrowser";
import HowItWorks from "@/components/layout/HowItWorks";
import FeaturedMusicians from "@/components/musicians/FeaturedMusicians";
import CTASection from "@/components/layout/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <GenreBrowser />
      <FeaturedMusicians />
      <CTASection />
    </>
  );
}
