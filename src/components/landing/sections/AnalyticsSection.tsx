import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, Activity } from 'lucide-react';

interface MetricCard {
  title: string;
  metric: string;
  unit: string;
  change: string;
  sparklinePath: string;
  accent: string;
  subtext: string;
}

const METRICS: MetricCard[] = [
  {
    title: 'Fleet Utilization',
    metric: '94.2',
    unit: '%',
    change: '+3.4% QoQ',
    sparklinePath: 'M 0 50 Q 30 45 60 30 T 120 20 T 180 35 T 240 10',
    accent: '#38bdf8',
    subtext: 'High-density load balancing across 12,400 active transport units.',
  },
  {
    title: 'On-Time SLA Delivery',
    metric: '99.84',
    unit: '%',
    change: '+0.12% Target',
    sparklinePath: 'M 0 35 Q 40 40 80 25 T 160 15 T 240 5',
    accent: '#34d399',
    subtext: 'Predictive machine dispatch eliminates terminal congestion bottlenecks.',
  },
  {
    title: 'Hub Throughput',
    metric: '48.2',
    unit: 'k/hr',
    change: '+14.2% YoY',
    sparklinePath: 'M 0 60 Q 40 30 90 40 T 170 15 T 240 8',
    accent: '#818cf8',
    subtext: 'High-velocity automated optical sortation at regional distribution gates.',
  },
  {
    title: 'Route Efficiency',
    metric: '+18.4',
    unit: '%',
    change: 'Saved / Trip',
    sparklinePath: 'M 0 45 Q 50 35 100 20 T 180 15 T 240 5',
    accent: '#38bdf8',
    subtext: 'Autonomous multi-drop TSP route optimization reducing deadhead kilometers.',
  },
  {
    title: 'Monthly Volume',
    metric: '1.42',
    unit: 'M',
    change: '+22.5% Vol',
    sparklinePath: 'M 0 55 Q 35 45 80 35 T 160 20 T 240 6',
    accent: '#38bdf8',
    subtext: 'Certified enterprise parcels logged, tracked, and settled across corridors.',
  },
];

export const AnalyticsSection: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState(0);

  return (
    <section id="analytics" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050811] text-white overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-1/2 right-1/4 w-[650px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 block mb-3">
            PERFORMANCE TELEMETRY · GLOBAL DATA
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Digital Intelligence.{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
              Measurable momentum.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Every movement generates verifiable telemetry. Instantaneous insight into capacity, throughput, latency, and capital efficiency.
          </p>
        </div>

        {/* Minimalist Grid of Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {METRICS.map((m, idx) => (
            <div
              key={m.title}
              onMouseEnter={() => setActiveMetric(idx)}
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-sky-500/40 transition-all duration-300 backdrop-blur-md flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-4">
                  <span className="text-slate-400 uppercase tracking-wider">{m.title}</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    {m.change}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums">
                    {m.metric}
                  </span>
                  <span className="text-lg font-bold text-sky-400 font-mono">
                    {m.unit}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-light mt-2">
                  {m.subtext}
                </p>
              </div>

              {/* Minimal Animated SVG Sparkline Chart */}
              <div className="mt-6 pt-4 border-t border-white/5 relative h-16 w-full">
                <svg viewBox="0 0 240 60" className="w-full h-full overflow-visible">
                  {/* Subtle Grid Line */}
                  <line x1="0" y1="58" x2="240" y2="58" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Glowing Trend Line */}
                  <motion.path
                    d={m.sparklinePath}
                    fill="none"
                    stroke={m.accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: idx * 0.15 }}
                  />

                  {/* Terminal Data Point */}
                  <circle cx="240" cy="10" r="3.5" fill={m.accent} className="shadow-[0_0_8px_#38bdf8]" />
                </svg>
              </div>
            </div>
          ))}

          {/* Sixth Feature Callout Tile */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 block">
                AUDIT INTEGRITY
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Normalized 3NF Relational Database
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                ACID compliant transactions ensure freight manifests, financial invoices, and tracking checkpoints stay strictly in sync with zero data corruption.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>DB Integrity:</span>
              <span className="text-emerald-400 font-bold">100% Referential</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
