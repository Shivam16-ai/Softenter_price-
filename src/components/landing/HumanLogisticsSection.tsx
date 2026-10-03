import React from 'react';
import { motion } from 'motion/react';
import { Users, HeartHandshake, ShieldCheck, Quote, Star, Award } from 'lucide-react';

interface Operator {
  name: string;
  role: string;
  hub: string;
  quote: string;
  experience: string;
  image: string;
}

export const HumanLogisticsSection: React.FC = () => {
  const operators: Operator[] = [
    {
      name: 'Marcus Vance',
      role: 'Master Linehaul Captain',
      hub: 'Southern Corridor · Scania High-Cube Fleet',
      quote:
        'When you haul 32 tons of critical electronics across 600 kilometers in the dark of night, having telemetry that anticipates road closures before you see them makes all the difference.',
      experience: '14 Years Active Service · 1.8M Safe Km',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Elena Rostova',
      role: 'Central Dispatch Operations Director',
      hub: 'Hyderabad Central Logistics Control Center',
      quote:
        'Software can predict a storm front over the interstate, but it takes an experienced dispatcher to coordinate rerouting fifty trucks without missing a single hospital pharmaceutical delivery.',
      experience: '11 Years · Supply Chain Operations',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'David Chen',
      role: 'High-Bay Robotics & Sort Superintendent',
      hub: 'Western Gateway Cross-Dock Hub, Mumbai',
      quote:
        'We process over 48,000 packages an hour through these automated chutes. Behind every machine is a team ensuring not a single fragile consignment gets crushed or misplaced.',
      experience: '8 Years · Industrial Automation',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section id="people" className="relative py-28 sm:py-36 bg-[#0c0d12] text-white border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="uppercase tracking-[0.25em] text-slate-300">
              THE PROFESSIONALS BEHIND THE NETWORK
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
            TECHNOLOGY MOVES DATA.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#FF5500] to-orange-200">
              PEOPLE MOVE THE WORLD.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Autonomous algorithms optimize the routes, but our master linehaul drivers, certified dock technicians, and dispatch directors deliver the trust.
          </p>
        </div>

        {/* 3 Operator Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {operators.map((op) => (
            <div
              key={op.name}
              className="rounded-3xl bg-[#141620] border border-white/10 overflow-hidden flex flex-col justify-between p-8 space-y-6 shadow-xl relative group hover:border-[#FF5500]/50 transition-all"
            >
              <Quote className="w-10 h-10 text-[#FF5500]/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <p className="text-sm text-slate-200 font-light leading-relaxed italic">
                  "{op.quote}"
                </p>

                <div className="text-[11px] font-mono text-amber-400">
                  {op.experience}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <img
                  src={op.image}
                  alt={op.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/20 filter brightness-95"
                />
                <div>
                  <h4 className="font-bold text-white text-base leading-tight">{op.name}</h4>
                  <span className="text-xs text-[#FF5500] font-mono block mt-0.5">{op.role}</span>
                  <span className="text-[11px] text-slate-500 font-mono block mt-0.5 truncate max-w-[200px]">
                    {op.hub}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Human Certification Strip */}
        <div className="p-8 rounded-3xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Continuous Driver Safety & Telematics Certification</h4>
              <p className="text-xs text-slate-400">
                Every linehaul captain completes defensive winter/monsoon handling and automated telematics simulator training.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-300 shrink-0">
            <div>
              <span className="text-emerald-400 font-bold block text-base">Zero</span>
              <span className="text-slate-500">Speeding Violations</span>
            </div>
            <div>
              <span className="text-white font-bold block text-base">100%</span>
              <span className="text-slate-500">Rest Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
