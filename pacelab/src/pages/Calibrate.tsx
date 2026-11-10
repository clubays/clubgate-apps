import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CameraView } from '@/components/camera/CameraView';
import { GateEditor } from '@/components/camera/GateEditor';
import { PermissionGate } from '@/components/camera/PermissionGate';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Panel } from '@/components/ui/Panel';
import { PITCH_PRESETS } from '@/constants';
import { saveCalibration } from '@/db/calibrations';
import { evaluateCalibrationQuality } from '@/functions/calibration/gates';
import { useCamera } from '@/hooks/useCamera';
import { useCalibrationStore } from '@/store/calibrationStore';
import { Calibration, LineSegment, Point2D } from '@/types';
import { generateId } from '@/utils/id';
import {
  Camera,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Ruler,
  Save,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const Component: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next') || '/live';

  const { activeCalibration, setActiveCalibration } = useCalibrationStore();

  // Stepper State: 1: Source, 2: Mark Gates, 3: Distance, 4: Verify & Save
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Live Camera
  const camera = useCamera({ autoStart: true, resolution: '720p', targetFps: 60 });
  const [frozenCanvas, setFrozenCanvas] = useState<HTMLCanvasElement | null>(null);
  const [imageSource, setImageSource] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calibration Data
  const [nativeWidth, setNativeWidth] = useState(1280);
  const [nativeHeight, setNativeHeight] = useState(720);

  const [gateA, setGateA] = useState<LineSegment>({
    p1: { x: 250, y: 150 },
    p2: { x: 250, y: 570 },
  });

  const [gateB, setGateB] = useState<LineSegment>({
    p1: { x: 1030, y: 150 },
    p2: { x: 1030, y: 570 },
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('crease_to_crease');
  const [distanceM, setDistanceM] = useState<number>(17.68);
  const [calibrationLabel, setCalibrationLabel] = useState<string>('Standard Pitch (17.68m)');
  const [mode, setMode] = useState<'gates' | 'homography'>('gates');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing calibration if present
  useEffect(() => {
    if (activeCalibration) {
      setGateA(activeCalibration.gateA);
      setGateB(activeCalibration.gateB);
      setDistanceM(activeCalibration.distanceM);
      setCalibrationLabel(activeCalibration.label);
      setNativeWidth(activeCalibration.videoWidth);
      setNativeHeight(activeCalibration.videoHeight);
    }
  }, [activeCalibration]);

  // Freeze current frame from live camera
  const handleFreezeFrame = () => {
    const video = camera.videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFrozenCanvas(canvas);
    setImageSource(canvas);
    setNativeWidth(canvas.width);
    setNativeHeight(canvas.height);

    // Position default gates nicely in the captured frame if not already positioned
    if (!activeCalibration) {
      const w = canvas.width;
      const h = canvas.height;
      setGateA({
        p1: { x: Math.round(w * 0.2), y: Math.round(h * 0.2) },
        p2: { x: Math.round(w * 0.2), y: Math.round(h * 0.8) },
      });
      setGateB({
        p1: { x: Math.round(w * 0.8), y: Math.round(h * 0.2) },
        p2: { x: Math.round(w * 0.8), y: Math.round(h * 0.8) },
      });
    }

    setCurrentStep(2);
  };

  // Upload an image or video still
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setFrozenCanvas(canvas);
        setImageSource(canvas);
        setNativeWidth(canvas.width);
        setNativeHeight(canvas.height);
        setCurrentStep(2);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // Calculate quality hint
  const quality = evaluateCalibrationQuality(gateA, gateB, distanceM, nativeWidth, 480);

  // Handle Preset Selection
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PITCH_PRESETS.find((p) => p.id === presetId);
    if (found && presetId !== 'custom') {
      setDistanceM(found.distanceM);
      setCalibrationLabel(found.label);
    }
  };

  // Save calibration
  const handleSaveCalibration = async () => {
    setIsSaving(true);
    const newCalibration: Calibration = {
      id: generateId('cal'),
      label: calibrationLabel || 'Custom Calibration',
      mode,
      videoWidth: nativeWidth,
      videoHeight: nativeHeight,
      gateA,
      gateB,
      distanceM,
      pixelsPerMetre: quality.pixelsPerMetre,
      createdAt: Date.now(),
    };

    await saveCalibration(newCalibration);
    setActiveCalibration(newCalibration);
    setIsSaving(false);
    navigate(nextUrl);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Stepper Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
            Pitch Calibration
          </h1>
          <p className="text-xs font-mono text-[var(--muted)]">
            Configure optical gate baseline for millisecond sub-frame speed calculations
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {[
            { num: 1, label: 'Source' },
            { num: 2, label: 'Gates' },
            { num: 3, label: 'Distance' },
            { num: 4, label: 'Verify' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => (frozenCanvas || s.num === 1) && setCurrentStep(s.num as typeof currentStep)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border cursor-pointer transition-colors ${
                currentStep === s.num
                  ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold'
                  : currentStep > s.num
                  ? 'border-[var(--speed)]/40 bg-[var(--speed)]/10 text-[var(--speed)]'
                  : 'border-[var(--line)] text-[var(--muted)] opacity-60'
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Source */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Panel title="CAMERA FEED PREVIEW" className="p-0 overflow-hidden">
              <PermissionGate
                hasPermission={camera.hasPermission}
                error={camera.error}
                isLoading={camera.isLoading}
                onRetry={camera.startCamera}
              >
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <CameraView videoRef={camera.videoRef} objectFit="contain" />
                </div>
              </PermissionGate>
            </Panel>
          </div>

          <div className="space-y-4">
            <Card withBrackets className="p-5 space-y-4">
              <h3 className="font-heading font-semibold text-base">Select Alignment Source</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Aim your camera side-on at the cricket pitch so both bowling crease / stumps and batting crease are clearly visible in the frame.
              </p>

              <div className="space-y-2 pt-2">
                <Button
                  variant="accent"
                  className="w-full justify-center"
                  onClick={handleFreezeFrame}
                  disabled={!camera.hasPermission || camera.isLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Freeze Current Frame
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo / Still Frame
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {camera.actualSettings && (
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[11px] font-mono text-[var(--muted)] space-y-1">
                  <div>Live Resolution: <strong className="text-[var(--text)]">{camera.actualSettings.width} × {camera.actualSettings.height}</strong></div>
                  <div>Reported Sensor FPS: <strong className="text-[var(--speed)]">{camera.actualSettings.frameRate.toFixed(0)} FPS</strong></div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Mark Gates */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-[6px] border border-[var(--line)]">
            <div className="text-xs font-mono space-y-0.5">
              <div className="text-[var(--text)] font-semibold">
                Drag handles A1/A2 (Gate A) and B1/B2 (Gate B) across the pitch
              </div>
              <div className="text-[var(--muted)]">
                Press Tab to switch handles. Use Arrow keys (or Shift + Arrow) to nudge by 1px / 10px.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Change Source
              </Button>
              <Button variant="accent" size="sm" onClick={() => setCurrentStep(3)}>
                Next: Distance
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="relative rounded-[6px] border border-[var(--line)] bg-black overflow-hidden aspect-video">
            {imageSource && (
              <img
                src={imageSource instanceof HTMLCanvasElement ? imageSource.toDataURL() : (imageSource as HTMLImageElement).src}
                alt="Calibration freeze frame"
                className="w-full h-full object-contain pointer-events-none"
              />
            )}
            <GateEditor
              imageSource={imageSource}
              nativeWidth={nativeWidth}
              nativeHeight={nativeHeight}
              gateA={gateA}
              gateB={gateB}
              onChangeGateA={setGateA}
              onChangeGateB={setGateB}
              className="absolute inset-0"
            />
          </div>
        </div>
      )}

      {/* Step 3: Distance Presets & Quality Analysis */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Panel title="PITCH DISTANCE PRESETS">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PITCH_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetChange(preset.id)}
                      className={`p-4 rounded-[6px] border cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-xs'
                          : 'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-heading font-semibold text-sm text-[var(--text)]">
                          {preset.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                      </div>
                      <div className="text-xl font-bold font-mono text-[var(--speed)] mb-1">
                        {preset.distanceM} m
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedPreset === 'custom' && (
                <div className="mt-4 p-4 rounded bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
                  <label className="block text-xs font-mono text-[var(--muted)]">
                    ENTER MEASURED TAPE DISTANCE (METRES)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    max="50"
                    value={distanceM}
                    onChange={(e) => setDistanceM(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded text-base font-mono font-bold text-[var(--speed)] bg-[var(--surface)] border border-[var(--line)]"
                  />
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="OPTICAL QUALITY EVALUATION">
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] mb-1">GATE PIXEL SPACING</div>
                  <div className="text-xl font-bold text-[var(--accent)]">
                    {quality.gateSpacingPx.toFixed(0)} px
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] mb-1">CALIBRATED SCALE</div>
                  <div className="text-xl font-bold text-[var(--speed)]">
                    {quality.pixelsPerMetre.toFixed(2)} px/m
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] mb-1">EXPECTED BALL DIAMETER</div>
                  <div className="text-xl font-bold text-[var(--text)]">
                    ~{quality.expectedBallDiameterPx.toFixed(1)} px
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-1">
                    At 480w detector working size
                  </div>
                </div>

                {quality.warning ? (
                  <div className="p-3 rounded bg-[var(--warn)]/10 border border-[var(--warn)]/40 text-[var(--warn)] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{quality.warning}</span>
                  </div>
                ) : (
                  <div className="p-3 rounded bg-[var(--speed)]/10 border border-[var(--speed)]/40 text-[var(--speed)] flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Optimal geometry: gate baseline and ball size provide high-confidence sub-frame timing.</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button variant="accent" onClick={() => setCurrentStep(4)}>
                  Next: Verify
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* Step 4: Verify & Save */}
      {currentStep === 4 && (
        <Card withBrackets className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--speed)]/15 border border-[var(--speed)]/40 text-[var(--speed)] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-heading">Calibration Summary</h2>
            <p className="text-xs text-[var(--muted)] font-mono">
              Ready to lock in optical scale for live ball tracking
            </p>
          </div>

          <div className="p-4 rounded-[6px] bg-[var(--surface-2)] border border-[var(--line)] space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Pitch Distance:</span>
              <span className="font-bold text-[var(--speed)]">{distanceM} metres</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Gate Baseline:</span>
              <span className="font-bold text-[var(--accent)]">{quality.gateSpacingPx.toFixed(0)} pixels</span>
            </div>
            <div className="flex justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">Scale:</span>
              <span className="font-bold text-[var(--text)]">{quality.pixelsPerMetre.toFixed(2)} px/m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Frame Resolution:</span>
              <span className="font-bold text-[var(--text)]">{nativeWidth} × {nativeHeight}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-[var(--muted)]">
              CALIBRATION PRESET NAME
            </label>
            <input
              type="text"
              value={calibrationLabel}
              onChange={(e) => setCalibrationLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] font-mono focus:outline-hidden focus:border-[var(--accent)]"
            />
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setCurrentStep(3)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              variant="accent"
              size="lg"
              onClick={handleSaveCalibration}
              isLoading={isSaving}
              className="flex-1 justify-center font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Start Tracking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
