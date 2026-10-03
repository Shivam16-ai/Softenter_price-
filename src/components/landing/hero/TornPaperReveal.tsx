import React from 'react';
import { motion } from 'motion/react';

interface TornPaperRevealProps {
  splitProgress: number; // 0 to 1
  isTorn: boolean;
}

export const TornPaperReveal: React.FC<TornPaperRevealProps> = ({ splitProgress, isTorn }) => {
  // If fully torn and faded, don't block pointer events
  if (splitProgress >= 1) return null;

  const leftTranslateX = -splitProgress * 80;
  const leftRotateZ = -splitProgress * 12;
  const rightTranslateX = splitProgress * 80;
  const rightRotateZ = splitProgress * 12;
  const paperOpacity = Math.max(0, 1 - splitProgress * 1.3);

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden"
      style={{ opacity: paperOpacity }}
    >
      {/* Background shadow & depth */}
      <div className="relative w-[92vw] max-w-4xl h-[420px] sm:h-[480px]">
        {/* Left Torn Half */}
        <motion.div
          className="absolute inset-y-0 left-0 w-[55%] origin-bottom-left"
          style={{
            transform: `translate3d(${leftTranslateX}%, 0, 0) rotate(${leftRotateZ}deg)`,
            transition: 'transform 0.05s linear',
          }}
        >
          <div
            className="w-full h-full bg-[#f6f6f2] text-slate-800 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-neutral-300 relative overflow-hidden"
            style={{
              clipPath:
                'polygon(0% 0%, 100% 0%, 88% 18%, 98% 34%, 84% 52%, 96% 70%, 86% 86%, 92% 100%, 0% 100%)',
            }}
          >
            {/* Paper Texture and Watermark */}
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute top-4 right-16 rotate-12 border-2 border-red-600/30 text-red-700/40 px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase">
              PRIORITY AIR-CARGO
            </div>

            {/* Manifest Header */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
              <div>
                <span className="font-extrabold text-sm tracking-widest text-slate-900 block">
                  SWIFTROUTE LOGISTICS
                </span>
                <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase">
                  Global Consignment Manifest
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-700 block">
                  AWB #928-8921-04
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  CLASS A · DANGEROUS GOODS: NO
                </span>
              </div>
            </div>

            {/* Manifest Rows */}
            <div className="space-y-3 font-mono text-[10px] text-slate-600">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">ORIGIN HUB:</span>
                <span className="font-semibold text-slate-800">CENTRAL DISPATCH · TERM-01</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">VESSEL / UNIT:</span>
                <span className="font-semibold text-slate-800">HEAVY FREIGHT HYBRID [TRK-204]</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">PAYLOAD GROSS:</span>
                <span className="font-semibold text-slate-800">18,450 KG · CONTAINERIZED</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">TELEMETRY ENCRYPT:</span>
                <span className="font-semibold text-slate-800">SHA-256 VERIFIED</span>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex items-center gap-1 opacity-70">
              <div className="h-9 w-1.5 bg-slate-900" />
              <div className="h-9 w-0.5 bg-slate-900" />
              <div className="h-9 w-2 bg-slate-900" />
              <div className="h-9 w-1 bg-slate-900" />
              <div className="h-9 w-3 bg-slate-900" />
              <div className="h-9 w-0.5 bg-slate-900" />
              <div className="h-9 w-2 bg-slate-900" />
              <div className="h-9 w-1 bg-slate-900" />
              <div className="h-9 w-2.5 bg-slate-900" />
              <div className="h-9 w-1 bg-slate-900" />
              <span className="text-[9px] font-mono ml-3 text-slate-500 tracking-widest">
                *SR-2026-EXPRESS*
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Torn Half */}
        <motion.div
          className="absolute inset-y-0 right-0 w-[55%] origin-bottom-right"
          style={{
            transform: `translate3d(${rightTranslateX}%, 0, 0) rotate(${rightRotateZ}deg)`,
            transition: 'transform 0.05s linear',
          }}
        >
          <div
            className="w-full h-full bg-[#f4f4ee] text-slate-800 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-neutral-300 relative overflow-hidden"
            style={{
              clipPath:
                'polygon(12% 0%, 100% 0%, 100% 100%, 8% 100%, 16% 86%, 4% 70%, 16% 52%, 2% 34%, 12% 18%)',
            }}
          >
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Right Manifest Content */}
            <div className="border-b border-slate-300 pb-3 mb-4 text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                DESTINATION CORRIDOR
              </span>
              <span className="font-extrabold text-xs text-slate-900 block">
                METRO EXPRESSWAY ➔ SECTOR 4
              </span>
            </div>

            <div className="space-y-3 font-mono text-[10px] text-slate-600 text-right">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">WAYPOINT STATUS:</span>
                <span className="font-semibold text-emerald-700">AUTHORIZED ROUTE</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">GEO-STAMP:</span>
                <span className="font-semibold text-slate-800">17.3850° N, 78.4867° E</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">DISPATCH TIMESTAMP:</span>
                <span className="font-semibold text-slate-800">10:42:09 UTC</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400">SIGNATURE POD:</span>
                <span className="font-semibold text-slate-800">PENDING CARRIER RECEIPT</span>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="mt-8 flex justify-end">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-900/30 flex items-center justify-center p-1 rotate-[-15deg]">
                <div className="text-center font-mono text-[8px] text-blue-950/40 uppercase font-bold leading-tight">
                  SWIFTROUTE<br />DISPATCHED<br />VERIFIED
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flying paper shards & fragments during tear */}
        {isTorn && splitProgress < 0.9 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => {
              const xDir = i % 2 === 0 ? -1 : 1;
              const xOffset = xDir * (splitProgress * 220 + i * 25);
              const yOffset = (i - 4) * 35 * splitProgress;
              const rot = i * 45 + splitProgress * 180;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-4 h-6 bg-[#f4f4ee] border border-neutral-300 shadow-md"
                  style={{
                    transform: `translate3d(${xOffset}px, ${yOffset}px, 0) rotate(${rot}deg) scale(${
                      1 - splitProgress * 0.8
                    })`,
                    clipPath: 'polygon(0% 0%, 100% 20%, 80% 100%, 10% 80%)',
                    opacity: 1 - splitProgress,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
