import { MessageCircleQuestion, Star } from "lucide-react";

type Testimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I was missing calls while out on jobs. Now my website handles enquiries 24/7 and books appointments directly into my diary. Game changer.",
    initials: "JM",
    name: "John Mitchell",
    role: "Mitchell Plumbing, Manchester",
  },
  {
    quote:
      "Our clinic was losing consultation requests outside hours. SpeakingSites answers questions about treatments and books consultations automatically. Brilliant.",
    initials: "SC",
    name: "Sarah Chen",
    role: "Radiance Aesthetics, London",
  },
  {
    quote:
      "Potential clients used to leave our website without engaging. Now the AI greets them, answers questions, and we've seen a 40% increase in consultations booked.",
    initials: "DT",
    name: "David Thompson",
    role: "Thompson Legal, Birmingham",
  },
];

export function Testimonials() {
  return (
    <section className="relative z-10 py-16 lg:py-24 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base text-gray-400">Local businesses winning more leads with SpeakingSites</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="p-6 sm:p-8 rounded-2xl bg-[#111] border border-neon/30">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-neon fill-neon" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon/20 to-neon/5 flex items-center justify-center text-neon font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-neon/10 border border-neon/20">
            <MessageCircleQuestion className="w-5 h-5 text-neon" strokeWidth={1.5} />
            <span className="text-sm text-neon">
              Got questions? Try the demo above — I&apos;ll answer them for you!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
