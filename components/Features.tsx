import { ArrowRight } from "lucide-react";

type Card = {
  number: string;
  title: string;
  body: string;
  highlight?: boolean;
};

const CARDS: Card[] = [
  {
    number: "01.",
    title: "Never Miss a Lead",
    body:
      "I answer every enquiry instantly — even at 3am on a Sunday. Your customers get help immediately, you get the lead.",
  },
  {
    number: "02.",
    title: "Industry Trained",
    body:
      "I know your business inside out. Services, prices, availability — I answer questions just like one of your own team.",
    highlight: true,
  },
  {
    number: "03.",
    title: "Books Appointments",
    body:
      "I don't just capture details — I book jobs straight into your calendar. Wake up to a full schedule.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 py-12 lg:py-24 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mr-auto ml-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-2">
          Your trusted <span className="text-neon">24/7 sales assistant.</span>
        </h2>
        <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 sm:mb-16">
          Small businesses lose thousands in revenue every year to missed calls.
          <br />
          We fix that by speaking with potential new clients instantly, 24 hours a day.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((c) =>
            c.highlight ? (
              <div
                key={c.number}
                className="p-6 sm:p-8 rounded-3xl bg-neon text-black border border-neon relative overflow-hidden transform md:-translate-y-4"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                <span className="text-5xl sm:text-6xl font-medium text-black">{c.number}</span>
                <h3 className="text-2xl sm:text-3xl font-medium text-black mt-4 sm:mt-6 mb-3">{c.title}</h3>
                <p className="text-black/80 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 font-medium">{c.body}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-bold text-black hover:opacity-70 transition-opacity"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                </a>
              </div>
            ) : (
              <div
                key={c.number}
                className="group p-6 sm:p-8 rounded-3xl bg-[#111] border border-[#ccff00]/40 hover:border-[#ccff00] transition-all duration-300 shadow-[0_0_20px_-12px_rgba(204,255,0,0.1)]"
              >
                <span className="text-5xl sm:text-6xl font-medium text-neon transition-colors">{c.number}</span>
                <h3 className="text-2xl sm:text-3xl font-medium text-white mt-4 sm:mt-6 mb-3">{c.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">{c.body}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-neon hover:text-white transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                </a>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
