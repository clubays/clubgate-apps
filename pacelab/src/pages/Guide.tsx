import React from 'react';
import { Card } from '@/components/ui/Card';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { calculateSpeedUncertainty } from '@/functions/speed/uncertainty';
import { useSettingsStore } from '@/store/settingsStore';
import { convertSpeed } from '@/utils/units';
import {
  ShieldCheck,
  CheckCircle2,
  Video,
  Sun,
  Eye,
  Sliders,
  HelpCircle,
  Camera,
  Layers,
} from 'lucide-react';

export const Component: React.FC = () => {
  const { units } = useSettingsStore();

  // Accuracy Table calculation: 135 km/h ball across 10m gate baseline
  const testSpeedKmh = 135;
  const testSpeedMps = testSpeedKmh / 3.6; // 37.5 m/s
  const baselineDistanceM = 10.0;
  const ppmAssumed = 65; // ~65 px/m for 10m baseline
  const deltaT = baselineDistanceM / testSpeedMps; // ~0.267s

  const fpsList = [30, 60, 120, 240];
  const accuracyRows = fpsList.map((fps) => {
    const sigmaMps = calculateSpeedUncertainty(
      testSpeedMps,
      deltaT,
      baselineDistanceM,
      ppmAssumed,
      1 / fps
    );
    const sigmaConverted = convertSpeed(sigmaMps, units);
    const speedConverted = convertSpeed(testSpeedMps, units);
    const errorPercent = (sigmaMps / testSpeedMps) * 100;

    return {
      fps,
      speedFormatted: speedConverted.toFixed(1),
      sigmaFormatted: `±${sigmaConverted.toFixed(1)} ${units}`,
      errorPercentFormatted: `±${errorPercent.toFixed(1)}%`,
      rating: fps >= 120 ? 'Optimal' : fps >= 60 ? 'Standard' : 'Acceptable',
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="border-b border-[var(--line)] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
          Field Setup & Accuracy Guide
        </h1>
        <p className="text-xs font-mono text-[var(--muted)]">
          Recommended camera placement geometry, accuracy formulas, and operational tips
        </p>
      </div>

      {/* 1. SVG Pitch Top-View Schematic */}
      <Panel title="RECOMMENDED CAMERA PLACEMENT (TOP VIEW)">
        <div className="w-full bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)] p-4 sm:p-6 overflow-hidden">
          <svg viewBox="0 0 800 320" className="w-full h-auto select-none font-mono">
            {/* Turf / Field outline */}
            <rect x="20" y="20" width="760" height="280" rx="6" fill="#080e14" stroke="var(--line)" strokeWidth="1.5" />

            {/* Pitch Strip (22 yards) */}
            <rect x="120" y="90" width="560" height="70" rx="3" fill="#141f2b" stroke="var(--line)" strokeWidth="1.5" />

            {/* Bowling Crease (Left) */}
            <line x1="160" y1="75" x2="160" y2="175" stroke="#7f94a3" strokeWidth="2" />
            <circle cx="160" cy="125" r="3" fill="#fbbf24" />
            <text x="160" y="65" fill="#7f94a3" fontSize="11" textAnchor="middle">BOWLER END</text>

            {/* Popping Crease (Left: 1.22m forward) */}
            <line x1="195" y1="75" x2="195" y2="175" stroke="#7f94a3" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Batting Crease / Stumps (Right) */}
            <line x1="640" y1="75" x2="640" y2="175" stroke="#7f94a3" strokeWidth="2" />
            <circle cx="640" cy="125" r="3" fill="#fbbf24" />
            <text x="640" y="65" fill="#7f94a3" fontSize="11" textAnchor="middle">BATSMAN END</text>

            {/* Popping Crease (Right: 1.22m forward) */}
            <line x1="605" y1="75" x2="605" y2="175" stroke="#7f94a3" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Gate A (Cyan) */}
            <line x1="220" y1="65" x2="220" y2="185" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="6 4" />
            <rect x="195" y="195" width="50" height="20" rx="3" fill="#05080c" stroke="#22d3ee" strokeWidth="1" />
            <text x="220" y="209" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">GATE A</text>

            {/* Gate B (Lime) */}
            <line x1="580" y1="65" x2="580" y2="185" stroke="#a3e635" strokeWidth="2.5" strokeDasharray="6 4" />
            <rect x="555" y="195" width="50" height="20" rx="3" fill="#05080c" stroke="#a3e635" strokeWidth="1" />
            <text x="580" y="209" fill="#a3e635" fontSize="10" fontWeight="bold" textAnchor="middle">GATE B</text>

            {/* Gate Baseline arrow */}
            <line x1="220" y1="125" x2="580" y2="125" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="400" y="115" fill="#a3e635" fontSize="11" textAnchor="middle">GATE BASELINE D (e.g. 17.68m)</text>

            {/* Ball path flight line */}
            <path d="M 160 125 Q 360 125, 640 125" stroke="#dc2626" strokeWidth="2" strokeDasharray="2 3" />

            {/* Camera Position (Side-on, Mid-pitch, Perpendicular) */}
            <circle cx="400" cy="270" r="10" fill="#22d3ee" stroke="#ffffff" strokeWidth="2" />
            <text x="400" y="300" fill="#22d3ee" fontSize="11" fontWeight="bold" textAnchor="middle">
              CAMERA (SIDE-ON, CHEST HEIGHT)
            </text>

            {/* Field of View Cone */}
            <polygon points="400,270 140,65 660,65" fill="#22d3ee" opacity="0.08" />
            <line x1="400" y1="270" x2="140" y2="65" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
            <line x1="400" y1="270" x2="660" y2="65" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono text-[var(--muted)]">
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
            <strong className="text-[var(--text)] block mb-1">Perpendicular Alignment</strong>
            Position tripod directly side-on opposite the pitch midpoint (~10m away).
          </div>
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
            <strong className="text-[var(--text)] block mb-1">Gate Baseline Width</strong>
            Ensure both Gate A and Gate B remain comfortably inside the camera viewport.
          </div>
          <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
            <strong className="text-[var(--text)] block mb-1">Chest/Waist Elevation</strong>
            Raise camera to approximately 1.2m to 1.5m to minimize pitch perspective skew.
          </div>
        </div>
      </Panel>

      {/* 2. Setup Checklist */}
      <Panel title="OPTIMAL ACCURACY CHECKLIST">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {[
            {
              title: 'Rigid Tripod or Stable Mount',
              desc: 'Never handhold the phone during live tracking; high-speed motion differencing requires a stationary camera frame.',
              icon: Camera,
            },
            {
              title: 'Target 60–120 FPS Capture',
              desc: 'Select 60 FPS or 120 FPS in Settings. At 140 km/h, a ball travels 0.65m per frame at 60 fps vs 0.32m at 120 fps.',
              icon: Layers,
            },
            {
              title: 'Bright, Consistent Lighting',
              desc: 'Outdoor daylight or well-lit indoor nets minimize motion blur streak noise and shutter exposure smear.',
              icon: Sun,
            },
            {
              title: 'High Contrast Background',
              desc: 'Match your ball color preset in Settings (Red, White, Pink, Orange) to maximize HSV isolation from turf or netting.',
              icon: Eye,
            },
            {
              title: 'Zero Digital Zoom',
              desc: 'Keep optical zoom at 1.0×. Digital zoom degrades spatial resolution and introduces pixel interpolation jitter.',
              icon: Sliders,
            },
            {
              title: 'Unobstructed Gate Corridor',
              desc: 'Ensure no fielders or training cones block the direct line of sight between Gate A and Gate B.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-3">
                <Icon className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--text)] mb-0.5">{item.title}</div>
                  <div className="text-[var(--muted)] leading-relaxed">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 3. Live Analytical Accuracy Table */}
      <Panel title="FRAME RATE VS SPEED UNCERTAINTY (135 KM/H BALL AT 10M BASELINE)">
        <p className="text-xs text-[var(--muted)] mb-4">
          Uncertainty values computed live using analytical error propagation: <code className="text-[var(--text)]">σ_v ≈ v · sqrt((√2·σ_t/Δt)² + (σ_d/D)²)</code> where timing quantization error is sub-frame interpolated.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] uppercase">
                <th className="py-2.5 px-3">Capture Rate</th>
                <th className="py-2.5 px-3">Ball Speed</th>
                <th className="py-2.5 px-3">Absolute Error</th>
                <th className="py-2.5 px-3">Relative Error</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {accuracyRows.map((row) => (
                <tr key={row.fps} className="hover:bg-[var(--surface-2)]/50">
                  <td className="py-3 px-3 font-bold text-[var(--accent)]">{row.fps} FPS</td>
                  <td className="py-3 px-3 text-[var(--text)]">{row.speedFormatted} {units}</td>
                  <td className="py-3 px-3 font-semibold text-[var(--speed)]">{row.sigmaFormatted}</td>
                  <td className="py-3 px-3 text-[var(--muted)]">{row.errorPercentFormatted}</td>
                  <td className="py-3 px-3">
                    <Badge variant={row.fps >= 120 ? 'speed' : row.fps >= 60 ? 'accent' : 'warn'} size="sm">
                      {row.rating}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 4. Frequently Asked Questions */}
      <Panel title="FREQUENTLY ASKED QUESTIONS">
        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="font-semibold text-sm text-[var(--text)] mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
              How does PaceLab measure ball speed without external radar hardware?
            </div>
            <p className="text-[var(--muted)] leading-relaxed pl-5.5">
              PaceLab transforms your camera into an optical timing gate array. By marking two known real-world boundaries (such as bowling crease to popping crease, or stumps to stumps), the computer vision pipeline detects the moving ball, tracks its 2D state vector using a Kalman filter, and measures the sub-frame crossing timestamps using segment-segment line interpolation.
            </p>
          </div>

          <div>
            <div className="font-semibold text-sm text-[var(--text)] mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
              What causes "Low Confidence" delivery flags?
            </div>
            <p className="text-[var(--muted)] leading-relaxed pl-5.5">
              A delivery is marked low confidence if trajectory linearity R² is below 0.98, fewer than 4 optical points were detected along the flight path, or if the gate timing speed and least-squares regression speed diverge by more than 6%.
            </p>
          </div>

          <div>
            <div className="font-semibold text-sm text-[var(--text)] mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
              What are the known physical limitations?
            </div>
            <p className="text-[var(--muted)] leading-relaxed pl-5.5">
              1. Ball elevation perspective: The ball flies above the ground plane, so a side-on perpendicular viewpoint is crucial.
              2. Rolling-shutter skew: High-speed bowling streaks can experience minor CMOS rolling-shutter slant; 120 FPS global or fast electronic shutters yield the best results.
            </p>
          </div>
        </div>
      </Panel>

      {/* 5. Privacy Statement */}
      <Card withBrackets className="p-5 sm:p-6 bg-[var(--surface-2)]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--speed)] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-heading font-semibold text-sm text-[var(--text)]">
              Privacy Constitution: 100% On-Device Execution
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              PaceLab makes zero network API calls at runtime. No camera frames, video clips, or telemetry metrics are ever uploaded to any server or cloud database. All computer vision processing runs locally in browser Web Workers, and all sessions are stored exclusively in your browser's local IndexedDB.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
