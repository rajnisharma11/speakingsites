import {
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  MessageCircle,
  MessageSquareText,
  UserPlus,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Clock,
    title: "24/7 Availability",
    body:
      "Every enquiry answered instantly — day, night, weekends, bank holidays. Never miss another lead.",
  },
  {
    icon: UserPlus,
    title: "Lead Capture",
    body:
      "Name, email, phone number — captured and sent straight to you. No lead slips through.",
  },
  {
    icon: CalendarCheck,
    title: "Instant Bookings",
    body:
      "I check your calendar availability in real-time and book appointments directly. No back-and-forth.",
  },
  {
    icon: MessageSquareText,
    title: "Smart Answers",
    body:
      "Trained on your business data. I answer FAQs about pricing, services, and coverage areas accurately.",
  },
];

export function AppFeatures() {
  return (
    <section className="relative z-10 py-16 lg:py-32 overflow-hidden">
      <div className="absolute right-0 top-1/4 w-1/2 h-1/2 bg-gradient-to-b from-neon/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-20">
        {/* Left: features list */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-4">
            Everything <span className="text-neon">You Need</span>{" "}
            <span className="text-gray-400">to Capture More Leads</span>
          </h2>

          <div className="pl-4 border-l border-neon/50 mb-8 sm:mb-12 mt-6">
            <p className="text-gray-400 text-sm max-w-sm">
              Stop losing customers to missed calls. Your AI assistant handles everything while you focus on the job.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8 sm:gap-y-12">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group">
                  <div className="w-10 h-10 rounded-full bg-neon flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">{f.title}</h4>
                  <p className="text-base text-gray-400 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: live dashboard mock */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-neon/10 via-transparent to-transparent rounded-3xl" />
          <div className="relative z-10 p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-black/90 backdrop-blur-xl rounded-xl p-5 sm:p-8 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-white">Live Dashboard</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">New Lead Captured</p>
                      <p className="text-xs text-gray-500">2 mins ago • Plumbing Enquiry</p>
                    </div>
                  </div>
                  <span className="text-neon text-sm font-bold">+£150</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Appointment Booked</p>
                      <p className="text-xs text-gray-500">15 mins ago • Boiler Service</p>
                    </div>
                  </div>
                  <span className="text-neon text-sm font-bold">Confirmed</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Question Answered</p>
                      <p className="text-xs text-gray-500">1 hour ago • Pricing Query</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
