import React from 'react';
import { Camera, CheckCircle2, ShieldAlert, Sparkles, Video } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';

export default function SetupGuidePage() {
  const frameRateTable = [
    { fps: '30 fps', dist: '1.30 m', grade: 'D (indicative only)', badgeColor: 'bg-[#e5473f] text-white' },
    { fps: '60 fps', dist: '0.65 m', grade: 'C (Fair accuracy)', badgeColor: 'bg-[#ffb020] text-[#0b0f14]' },
    { fps: '120 fps', dist: '0.32 m', grade: 'B (High speed)', badgeColor: 'bg-[#c6ff3d] text-[#0b0f14]' },
    { fps: '240 fps', dist: '0.16 m', grade: 'A (Match precision)', badgeColor: 'bg-[#2fd27e] text-[#0b0f14]' },
  ];

  const guideSteps = [
    {
      num: 1,
      title: 'Place camera side-on at mid-pitch',
      desc: 'Position tripod side-on, at the middle of the pitch (approx. 10m from either end), 15 to 25m back, at about 1m camera height.',
    },
    {
      num: 2,
      title: 'Keep both sets of stumps in view',
      desc: 'Both the bowling crease and batting crease stumps must be fully visible with at least 5% margin on left and right borders.',
    },
    {
      num: 3,
      title: 'Lock focus and exposure',
      desc: 'Lock AE/AF to prevent camera hunting exposure changes during the bowler run-up. High natural light or floodlights are ideal.',
    },
    {
      num: 4,
      title: 'High-contrast clothing',
      desc: 'Wear a shirt that contrasts with the ball (e.g. dark shirt for white/pink balls, light shirt for red leather match balls).',
    },
    {
      num: 5,
      title: 'Shoot at highest available frame rate',
      desc: 'Use 120 fps or 240 fps slow-motion mode on modern iPhone / Android cameras. If filmed at 240 fps, enter 240 in the capture rate prompt.',
    },
    {
      num: 6,
      title: 'Do not move tripod after calibration',
      desc: 'Once the 4 stump landmarks are tapped, camera optical geometry is locked. Do not zoom, re-pan, or bump the tripod.',
    },
  ];

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="font-condensed text-4xl md:text-5xl font-bold tracking-tight text-[#e8eef5] mb-2 uppercase">
          Camera Setup & Physics Guide
        </h1>
        <p className="text-[#8a9ab0] text-sm md:text-base leading-relaxed">
          How to place your camera, calibrate the 20.12 m pitch, and configure slow-motion capture for Grade A speed precision.
        </p>

        {/* Top Camera Placement Inline SVG Diagram */}
        <div className="my-8 card-panel p-4 md:p-6 bg-[#121923]">
          <h2 className="font-condensed text-xl font-bold text-[#e8eef5] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#c6ff3d]" />
            <span>Optimal Side-on Camera Geometry</span>
          </h2>

          <div className="w-full bg-[#0b0f14] border border-[#243146] rounded-xl p-4 overflow-x-auto flex justify-center">
            <svg viewBox="0 0 700 280" className="w-full max-w-[650px] select-none text-xs">
              {/* Pitch ground */}
              <rect x="100" y="50" width="500" height="40" fill="#2a2216" stroke="#524330" rx="3" />
              {/* Center pitch axis dashed */}
              <line x1="100" y1="70" x2="600" y2="70" stroke="rgba(198, 255, 61, 0.4)" strokeDasharray="4 3" />

              {/* Bowler stumps */}
              <line x1="120" y1="40" x2="120" y2="100" stroke="#ffb020" strokeWidth="3" />
              <text x="120" y="32" fill="#ffb020" fontSize="10" textAnchor="middle" fontWeight="bold">
                Bowler (0m)
              </text>

              {/* Striker stumps */}
              <line x1="580" y1="40" x2="580" y2="100" stroke="#ffb020" strokeWidth="3" />
              <text x="580" y="32" fill="#ffb020" fontSize="10" textAnchor="middle" fontWeight="bold">
                Striker (20.12m)
              </text>

              {/* 22 Yards dimension line */}
              <line x1="120" y1="110" x2="580" y2="110" stroke="#8a9ab0" strokeWidth="1" />
              <text x="350" y="125" fill="#8a9ab0" fontSize="10" textAnchor="middle">
                20.12 m (22 yards)
              </text>

              {/* Camera Icon on Tripod */}
              <g transform="translate(350, 210)">
                {/* Tripod legs */}
                <line x1="0" y1="10" x2="-25" y2="50" stroke="#e8eef5" strokeWidth="2" />
                <line x1="0" y1="10" x2="0" y2="50" stroke="#e8eef5" strokeWidth="2" />
                <line x1="0" y1="10" x2="25" y2="50" stroke="#e8eef5" strokeWidth="2" />
                {/* Camera body */}
                <rect x="-18" y="-12" width="36" height="22" rx="4" fill="#c6ff3d" />
                <circle cx="0" cy="-1" r="5" fill="#0b0f14" />
                <rect x="8" y="-18" width="10" height="6" fill="#c6ff3d" rx="1" />
              </g>

              {/* Field of View cone */}
              <polygon
                points="350,200 90,50 610,50"
                fill="rgba(198, 255, 61, 0.06)"
                stroke="rgba(198, 255, 61, 0.3)"
                strokeDasharray="4 2"
              />

              <text x="350" y="170" fill="#c6ff3d" fontSize="11" textAnchor="middle" fontWeight="bold">
                15 – 25 m back at mid-wicket / covers
              </text>
            </svg>
          </div>
        </div>

        {/* Frame Rate vs Precision Table */}
        <div className="my-8 card-panel p-4 md:p-6 bg-[#121923]">
          <h2 className="font-condensed text-xl font-bold text-[#e8eef5] mb-2">
            Frame Rate Physics: Why 120+ FPS Matters
          </h2>
          <p className="text-xs text-[#8a9ab0] mb-4">
            At 140 km/h (38.9 m/s), the ball travels rapidly between successive sensor exposures:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eef5] border-collapse">
              <thead>
                <tr className="border-b border-[#243146] text-[#8a9ab0]">
                  <th className="py-2.5 px-3">Frame Rate</th>
                  <th className="py-2.5 px-3">Distance per frame at 140 km/h</th>
                  <th className="py-2.5 px-3">Quality Rating</th>
                </tr>
              </thead>
              <tbody>
                {frameRateTable.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#243146]/50">
                    <td className="py-3 px-3 font-mono font-bold">{row.fps}</td>
                    <td className="py-3 px-3 font-mono text-[#c6ff3d]">{row.dist}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.badgeColor}`}>
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6 Step Check-list */}
        <div className="my-8 space-y-4">
          <h2 className="font-condensed text-2xl font-bold text-[#e8eef5] uppercase">
            6 Golden Rules for Accurate Speeds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideSteps.map((step) => (
              <div key={step.num} className="card-panel-elevated p-4 flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-[#c6ff3d] text-[#0b0f14] font-black text-sm flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e8eef5] mb-1">{step.title}</h3>
                  <p className="text-xs text-[#8a9ab0] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
