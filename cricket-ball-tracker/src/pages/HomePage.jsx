import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Camera, HelpCircle, History, ShieldCheck, Target, Zap, ArrowRight, Gauge, Ruler, PlayCircle } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import Button from '../components/ui/Button.jsx';

export default function HomePage() {
  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182231] border border-[#243146] text-xs font-semibold text-[#c6ff3d] mb-6 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Pure In-Browser Metric Computer Vision • No Cloud Uploads</span>
        </div>

        {/* Hero Title & Sub-line */}
        <h1 className="font-condensed text-5xl md:text-7xl font-bold tracking-tight text-center text-[#e8eef5] max-w-4xl uppercase">
          Know how fast it <span className="text-[#c6ff3d]">really</span> was.
        </h1>
        <p className="mt-4 text-base md:text-xl text-[#8a9ab0] text-center max-w-2xl font-normal leading-relaxed">
          Film a delivery. Tap the stumps once. Get speed, length and bounce in seconds, all on your device.
        </p>

        {/* Three Primary Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          {/* Card 1: Analyse Clip */}
          <Link
            to="/analyze"
            className="card-panel-elevated p-6 flex flex-col justify-between hover:border-[#c6ff3d] transition-all group hover:-translate-y-1 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c6ff3d]/5 rounded-bl-full pointer-events-none group-hover:bg-[#c6ff3d]/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#c6ff3d] text-[#0b0f14] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="font-condensed text-2xl font-bold text-[#e8eef5] tracking-wide mb-2">
                ANALYSE A CLIP
              </h2>
              <p className="text-sm text-[#8a9ab0] leading-relaxed">
                Upload a slow-motion phone video or record a bowling clip. Calibrate the pitch in 4 taps, track the ball trajectory, and inspect frame-by-frame.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#c6ff3d] group-hover:translate-x-1 transition-transform">
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Live Speed Gun */}
          <Link
            to="/live"
            className="card-panel-elevated p-6 flex flex-col justify-between hover:border-[#2fd27e] transition-all group hover:-translate-y-1 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2fd27e]/5 rounded-bl-full pointer-events-none group-hover:bg-[#2fd27e]/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#2fd27e] text-[#0b0f14] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <h2 className="font-condensed text-2xl font-bold text-[#e8eef5] tracking-wide mb-2">
                LIVE SPEED GUN
              </h2>
              <p className="text-sm text-[#8a9ab0] leading-relaxed">
                Mount your phone on a tripod at mid-wicket. Arm the speed gun and get release speeds called out in real-time within ~1s of every delivery.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#2fd27e] group-hover:translate-x-1 transition-transform">
              <span>Open Speed Gun</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Camera Setup Guide */}
          <Link
            to="/guide"
            className="card-panel-elevated p-6 flex flex-col justify-between hover:border-[#38bdf8] transition-all group hover:-translate-y-1 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/5 rounded-bl-full pointer-events-none group-hover:bg-[#38bdf8]/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#182231] border border-[#243146] text-[#38bdf8] flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="font-condensed text-2xl font-bold text-[#e8eef5] tracking-wide mb-2">
                CAMERA SETUP GUIDE
              </h2>
              <p className="text-sm text-[#8a9ab0] leading-relaxed">
                Learn optimal camera positioning (15–25m back at mid-wicket), frame rate physics table (60 vs 120 vs 240 fps), and accuracy tips for Grade A speeds.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#38bdf8] group-hover:translate-x-1 transition-transform">
              <span>View Guide</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 w-full pt-10 border-t border-[#243146] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#121923] border border-[#243146] rounded-xl flex items-center gap-3">
            <Gauge className="w-6 h-6 text-[#c6ff3d] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#e8eef5] block">Fitted Derivatives</span>
              <span className="text-[11px] text-[#8a9ab0]">Presentation timestamps regression</span>
            </div>
          </div>

          <div className="p-4 bg-[#121923] border border-[#243146] rounded-xl flex items-center gap-3">
            <Ruler className="w-6 h-6 text-[#2fd27e] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#e8eef5] block">Pitch Homography</span>
              <span className="text-[11px] text-[#8a9ab0]">20.12m stumps calibration</span>
            </div>
          </div>

          <div className="p-4 bg-[#121923] border border-[#243146] rounded-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-[#ffb020] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#e8eef5] block">Kalman Trajectory</span>
              <span className="text-[11px] text-[#8a9ab0]">4-state filter & RTS smoothing</span>
            </div>
          </div>

          <div className="p-4 bg-[#121923] border border-[#243146] rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#38bdf8] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#e8eef5] block">Uncertainty & Grades</span>
              <span className="text-[11px] text-[#8a9ab0]">± Covariance & A–D grades</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
