import { UserPlus, Search, CalendarCheck, DollarSign } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up as a musician or venue. Add your bio, genre, photos, YouTube clips, and Spotify link.",
    step: "01",
  },
  {
    icon: Search,
    title: "Get Discovered",
    description: "Venues browse by genre, city, and availability. Your music speaks for itself.",
    step: "02",
  },
  {
    icon: CalendarCheck,
    title: "Book the Show",
    description: "Venue sends a booking request. Confirm the date, time, and rate — all in the platform.",
    step: "03",
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description: "Payment handled securely via Stripe. We take just 5%. You keep the rest.",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">How It Works</h2>
          <p className="text-[#B3B3B3] text-lg max-w-xl mx-auto">Simple, transparent, built for working musicians.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative bg-[#1E1E1E] rounded-2xl p-6 border border-white/5 hover:border-[#1DB954]/30 transition-all group"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-white/5 group-hover:text-[#1DB954]/10 transition-colors">
                {step.step}
              </div>
              <div className="w-12 h-12 bg-[#1DB954]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1DB954]/20 transition-colors">
                <step.icon className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-[#B3B3B3] text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
