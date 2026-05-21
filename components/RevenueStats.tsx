import { ArrowRight, Star, TrendingDown } from "lucide-react";

export function RevenueStats() {
  return (
    <section className="relative z-10 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Chart visual */}
          <div className="relative bg-[#0F0F0F] rounded-2xl border border-red-500/30 p-5 sm:p-8 overflow-hidden">
            <div className="flex justify-between items-start mb-8 sm:mb-12 relative z-10 gap-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Average Annual Loss</p>
                <p className="text-3xl sm:text-4xl font-medium text-white tracking-tight">£126,000</p>
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" strokeWidth={1.5} />
                  Lost to missed calls
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded text-xs text-red-400">
                Callers who never call back <span className="text-lg font-bold text-red-500">85%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] sm:text-xs text-gray-500">Calls unanswered</p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">62%</p>
              </div>
              <div className="p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] sm:text-xs text-gray-500">Cost per missed call</p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">£1,200</p>
              </div>
              <div className="p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] sm:text-xs text-gray-500">SMBs losing £500+/mo</p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">42%</p>
              </div>
            </div>

            <div className="relative h-48 w-full">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                <path
                  d="M0,40 L0,35 C20,35 30,15 50,25 C70,35 80,5 100,5 L100,40 Z"
                  fill="url(#gradientRed)"
                />
                <path
                  d="M0,35 C20,35 30,15 50,25 C70,35 80,5 100,5"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="5" r="1.5" fill="#ef4444" stroke="#0F0F0F" strokeWidth="0.5" />
              </svg>

              <div className="absolute top-0 right-0 mt-2 transform translate-x-2 z-20 pointer-events-none">
                <div className="bg-[#1a1a1a]/90 border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Monthly Loss</div>
                  <div className="text-sm text-white font-bold">£10,500+</div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45" />
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-600 mt-2 px-1">
              <span>Jan</span>
              <span>Mar</span>
              <span>Jun</span>
              <span>Sep</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Text content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-6">
              Available <span className="text-neon">24/7</span>, anytime &amp; anywhere.
            </h2>

            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-neon fill-neon" strokeWidth={1.5} />
              ))}
            </div>

            <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed">
              While you&apos;re under a sink, in court, or treating a patient — I&apos;m on your website handling enquiries and booking your next job.
            </p>

            <div className="flex items-start gap-4 mb-10 pl-4 border-l-2 border-neon">
              <p className="text-sm text-gray-500 italic">
                &ldquo;Your competitors are investing in AI. The businesses that adopt early will capture the leads that others miss.&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-6" id="pricing">
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-black bg-neon rounded-full hover:bg-white transition-colors"
              >
                See Pricing
              </a>
              <a
                href="#"
                className="inline-flex items-center text-sm font-medium text-white hover:text-neon transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </a>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-sm text-gray-400">Plans from</span>
              <span className="text-lg font-bold text-neon">£297/month</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
