import { ArrowRight, Mic } from "lucide-react";

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-5.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const PRODUCT = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#" },
  { label: "Changelog", href: "#" },
];

const COMPANY = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
];

const RESOURCES = [
  { label: "Documentation", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Community", href: "#" },
  { label: "Partner Program", href: "#" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Security", href: "#" },
];

function LinkColumn({ heading, items }: { heading: string; items: { label: string; href: string }[] }) {
  return (
    <div className="md:col-span-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{heading}</h3>
      <ul className="space-y-3 text-sm text-gray-500">
        {items.map((i) => (
          <li key={i.label}>
            <a href={i.href} className="hover:text-neon transition-colors">
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-16 sm:pt-24 pb-12 border-t border-white/5 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-12 sm:mb-20">
          <div className="max-w-md">
            <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-2">
              Stay ahead of the curve.
            </h3>
            <p className="text-gray-400 text-sm">
              Join our newsletter for the latest AI updates, industry insights, and feature releases.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon/50 w-full md:w-80 transition-all hover:bg-white/10"
              />
              <button
                type="button"
                className="bg-neon text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-white transition-colors flex items-center gap-2"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10 sm:mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-12 mb-10 sm:mb-16">
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5">
                <Mic className="w-4 h-4 text-neon" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-medium tracking-tight text-white">
                Speaking<span className="text-gray-400">Sites</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The AI voice assistant that turns website visitors into booked appointments. Available 24/7 for your business.
            </p>
          </div>

          <LinkColumn heading="Product" items={PRODUCT} />
          <LinkColumn heading="Company" items={COMPANY} />
          <LinkColumn heading="Resources" items={RESOURCES} />
          <LinkColumn heading="Legal" items={LEGAL} />
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">© 2024 SpeakingSites. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
