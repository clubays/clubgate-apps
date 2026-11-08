import React, { useState } from 'react';
import { Award, CheckCircle, Play, RefreshCw, XCircle } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { runSyntheticTest } from '../functions/synth.js';
import { median } from '../utils/math.js';

export default function SelfTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const testCases = [
    { v0: 25.0, fps: 60, label: '90 km/h @ 60 fps' },
    { v0: 35.0, fps: 60, label: '126 km/h @ 60 fps' },
    { v0: 42.0, fps: 60, label: '151 km/h @ 60 fps' },
    { v0: 25.0, fps: 120, label: '90 km/h @ 120 fps' },
    { v0: 35.0, fps: 120, label: '126 km/h @ 120 fps' },
    { v0: 42.0, fps: 120, label: '151 km/h @ 120 fps' },
    { v0: 25.0, fps: 240, label: '90 km/h @ 240 fps' },
    { v0: 35.0, fps: 240, label: '126 km/h @ 240 fps' },
    { v0: 42.0, fps: 240, label: '151 km/h @ 240 fps' },
  ];

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentIdx(0);

    const testResults = [];
    for (let i = 0; i < testCases.length; i++) {
      setCurrentIdx(i);
      const tc = testCases[i];
      const res = await runSyntheticTest(tc.v0, tc.fps);
      testResults.push(res);
      setResults([...testResults]);
    }

    setIsRunning(false);
  };

  // Group errors by fps for pass/fail bounds verification
  const errors60 = results.filter((r) => r.fps === 60).map((r) => r.errorKmh);
  const errors120 = results.filter((r) => r.fps === 120).map((r) => r.errorKmh);
  const errors240 = results.filter((r) => r.fps === 240).map((r) => r.errorKmh);

  const median60 = errors60.length > 0 ? median(errors60) : null;
  const median120 = errors120.length > 0 ? median(errors120) : null;
  const median240 = errors240.length > 0 ? median(errors240) : null;

  const passed60 = median60 !== null && median60 < 6.0;
  const passed120 = median120 !== null && median120 < 3.0;
  const passed240 = median240 !== null && median240 < 2.0;

  const isAllComplete = results.length === testCases.length;
  const allPassed = isAllComplete && passed60 && passed120 && passed240;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-condensed text-4xl md:text-5xl font-bold tracking-tight text-[#e8eef5] uppercase">
              Synthetic Accuracy Test
            </h1>
            <p className="text-[#8a9ab0] text-sm mt-1">
              9 full-pipeline simulated deliveries across 3 speeds and 3 frame rates with noise, drag, and bounce.
            </p>
          </div>

          <Button
            onClick={handleRunTests}
            disabled={isRunning}
            icon={isRunning ? Spinner : Play}
            className="font-bold"
          >
            {isRunning ? `Running (${currentIdx + 1}/9)...` : 'Run Accuracy Test'}
          </Button>
        </div>

        {/* Error Bounds Thresholds Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-panel-elevated p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-[#8a9ab0] uppercase">240 FPS (Slow Motion)</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold text-[#2fd27e]">
                {median240 !== null ? `${median240.toFixed(2)} km/h` : '—'}
              </span>
              <span className="text-xs text-[#8a9ab0]">median error</span>
            </div>
            <span className="text-[11px] text-[#8a9ab0]">Required: &lt; 2.0 km/h</span>
          </div>

          <div className="card-panel-elevated p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-[#8a9ab0] uppercase">120 FPS (High Speed)</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold text-[#c6ff3d]">
                {median120 !== null ? `${median120.toFixed(2)} km/h` : '—'}
              </span>
              <span className="text-xs text-[#8a9ab0]">median error</span>
            </div>
            <span className="text-[11px] text-[#8a9ab0]">Required: &lt; 3.0 km/h</span>
          </div>

          <div className="card-panel-elevated p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-[#8a9ab0] uppercase">60 FPS (Standard Camera)</span>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold text-[#ffb020]">
                {median60 !== null ? `${median60.toFixed(2)} km/h` : '—'}
              </span>
              <span className="text-xs text-[#8a9ab0]">median error</span>
            </div>
            <span className="text-[11px] text-[#8a9ab0]">Required: &lt; 6.0 km/h</span>
          </div>
        </div>

        {/* Overall Status Banner */}
        {isAllComplete && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
              allPassed
                ? 'bg-[#2fd27e]/15 border-[#2fd27e] text-[#2fd27e]'
                : 'bg-[#e5473f]/15 border-[#e5473f] text-[#e5473f]'
            }`}
          >
            <div className="flex items-center gap-3">
              {allPassed ? <Award className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              <div>
                <h3 className="font-bold text-base">
                  {allPassed ? 'ALL ACCURACY BENCHMARKS PASSED' : 'BENCHMARK COMPLETED WITH WARNINGS'}
                </h3>
                <p className="text-xs opacity-90">
                  {allPassed
                    ? 'Browser homography, Kalman tracking and least-squares regression perform within strict error tolerances.'
                    : 'Some frame rate configurations exceeded target median error.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#243146] font-bold text-sm text-[#e8eef5] flex justify-between items-center">
            <span>Test Results Breakdown</span>
            <span className="text-xs text-[#8a9ab0]">{results.length} / 9 Tests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eef5]">
              <thead>
                <tr className="border-b border-[#243146] bg-[#0b0f14]/50 text-[#8a9ab0]">
                  <th className="py-2.5 px-4">Test #</th>
                  <th className="py-2.5 px-4">True Speed</th>
                  <th className="py-2.5 px-4">FPS</th>
                  <th className="py-2.5 px-4">Tracked Points</th>
                  <th className="py-2.5 px-4">Fitted Speed</th>
                  <th className="py-2.5 px-4">Absolute Error</th>
                  <th className="py-2.5 px-4">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} className="border-b border-[#243146]/40 hover:bg-[#182231]/30">
                    <td className="py-2.5 px-4 font-mono font-bold">#{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono">{r.trueKmh.toFixed(1)} km/h</td>
                    <td className="py-2.5 px-4 font-mono text-[#c6ff3d]">{r.fps} fps</td>
                    <td className="py-2.5 px-4 font-mono">{r.pointCount}</td>
                    <td className="py-2.5 px-4 font-mono font-bold">{r.measuredKmh.toFixed(1)} km/h</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#ffb020]">
                      {r.errorKmh.toFixed(2)} km/h
                    </td>
                    <td className="py-2.5 px-4">
                      {r.passed ? (
                        <span className="inline-flex items-center gap-1 text-[#2fd27e] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#e5473f] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#8a9ab0]">
                      Press "Run Accuracy Test" to benchmark the tracker algorithms against known synthetic deliveries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
