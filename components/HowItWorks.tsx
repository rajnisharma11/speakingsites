import { ArrowRight, Building2, BrainCircuit, Zap } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-[#0a0a0a] z-10 border-white/5 pt-16 pb-16 sm:pt-24 sm:pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium text-white tracking-tight mb-10 sm:mb-16">
          How <span className="text-neon">Speaking Sites</span> Works
          <span className="block text-sm sm:text-lg font-normal text-gray-400 mt-4 sm:mt-6 tracking-normal">
            Three simple steps to never miss another lead.
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0F0F0F] border border-[#ccff00]/40 group hover:border-[#ccff00] transition-colors">
            <div className="w-12 h-12 rounded-full bg-neon text-black flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">Pick Your Industry</h3>
            <p className="text-gray-400 text-sm">
              Select your trade or profession. Our AI comes pre-loaded with industry knowledge.
            </p>
          </div>

          <div className="relative p-6 sm:p-8 rounded-2xl bg-neon text-black transform scale-105 shadow-[0_0_50px_-12px_rgba(204,255,0,0.3)] z-10">
            <div className="w-12 h-12 rounded-full border border-black/20 text-black flex items-center justify-center mx-auto mb-6 bg-black/5">
              <BrainCircuit className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-black mb-3">We Train The AI</h3>
            <p className="text-black/80 text-sm font-medium mb-6">
              We scan your website and train me on your services, prices, and FAQs. I become YOUR expert.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full inline-flex items-center"
            >
              Learn More
              <ArrowRight className="w-3 h-3 ml-2" strokeWidth={1.5} />
            </button>
          </div>

          <div className="group hover:border-[#ccff00] transition-colors bg-[#0F0F0F] border-[#ccff00]/40 border rounded-2xl p-6 sm:p-8 relative">
            <div className="w-12 h-12 rounded-full bg-neon text-black flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">Go Live 24/7</h3>
            <p className="text-gray-400 text-sm">
              I appear on your website instantly. Your customers can talk to me anytime — you never miss another lead.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
