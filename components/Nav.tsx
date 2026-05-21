import { Menu, Mic } from "lucide-react";

export function Nav() {
  return (
    <nav className="relative z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 group-hover:border-[#ccff00]/50 transition-colors">
            <Mic className="w-5 h-5 text-neon" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon rounded-full animate-pulse" />
          </div>
          <span className="text-xl font-medium tracking-tight text-white">
            Speaking<span className="text-gray-400">Sites</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <a
          href="#try-demo"
          className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-black bg-neon rounded-full hover:bg-white transition-colors"
        >
          Try The Demo
        </a>

        <button className="md:hidden text-white" aria-label="Open menu">
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
