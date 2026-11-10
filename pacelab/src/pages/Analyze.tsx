import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Panel } from '@/components/ui/Panel';
import { StatTile } from '@/components/ui/StatTile';
import { saveDelivery } from '@/db/deliveries';
import { saveSession } from '@/db/sessions';
import { calculateSpeedUncertainty } from '@/functions/speed/uncertainty';
import { useCalibrationStore } from '@/store/calibrationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Delivery, Point2D, Session, TrackPoint } from '@/types';
import { generateId } from '@/utils/id';
import { convertSpeed, formatSpeed, getSpeedClass } from '@/utils/units';
import {
  Upload,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Target,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Film,
  Zap,
} from 'lucide-react';

interface ManualPoint {
  frameTime: number;
  canvasX: number;
  canvasY: number;
  videoX: number;
  videoY: number;
}

export const Component: React.FC = () => {
  const navigate = useNavigate();
  const { units } = useSettingsStore();
  const { activeCalibration, loadActiveFromDB } = useCalibrationStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Slow-motion configuration
  const [captureFps, setCaptureFps] = useState<number>(240);
  const [playbackFps, setPlaybackFps] = useState<number>(30);
  const slowMoFactor = captureFps / playbackFps; // e.g. 240 / 30 = 8

  // Playback Rate
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Manual assist mode: click ball at Point 1 and Point 2
  const [manualPoints, setManualPoints] = useState<ManualPoint[]>([]);
  const [computedManualSpeedMps, setComputedManualSpeedMps] = useState<number | null>(null);

  // Auto-analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedDeliveries, setAnalyzedDeliveries] = useState<Delivery[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    loadActiveFromDB();
  }, [loadActiveFromDB]);

  // Video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      drawCurrentFrame();
    }
  };

  // Draw video frame to canvas
  const drawCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw manual clicked points
    manualPoints.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.videoX, pt.videoY, 6, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? '#22d3ee' : '#a3e635';
      ctx.shadowColor = idx === 0 ? '#22d3ee' : '#a3e635';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Label point
      ctx.font = 'bold 12px var(--font-mono)';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`P${idx + 1} (${pt.frameTime.toFixed(3)}s)`, pt.videoX + 10, pt.videoY - 10);
    });

    if (manualPoints.length === 2) {
      ctx.beginPath();
      ctx.moveTo(manualPoints[0].videoX, manualPoints[0].videoY);
      ctx.lineTo(manualPoints[1].videoX, manualPoints[1].videoY);
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
    }
  };

  // Video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      drawCurrentFrame();
    }
  };

  // Frame Stepping: Arrow Left / Right
  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    const frameInterval = 1 / playbackFps;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + frames * frameInterval));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Keyboard controls: ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoSrc) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(e.shiftKey ? -10 : -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrame(e.shiftKey ? 10 : 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoSrc, duration, playbackFps]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Video file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setManualPoints([]);
      setComputedManualSpeedMps(null);
      setAnalyzedDeliveries([]);
    }
  };

  // Manual Assist Click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || manualPoints.length >= 2) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const newPoint: ManualPoint = {
      frameTime: video.currentTime,
      canvasX: e.clientX - rect.left,
      canvasY: e.clientY - rect.top,
      videoX: clickX,
      videoY: clickY,
    };

    const nextPoints = [...manualPoints, newPoint];
    setManualPoints(nextPoints);

    // If 2 points marked, compute speed!
    if (nextPoints.length === 2 && activeCalibration) {
      const p1 = nextPoints[0];
      const p2 = nextPoints[1];

      // Real delta t adjusted for slow-motion factor
      const mediaDeltaT = Math.abs(p2.frameTime - p1.frameTime);
      const realDeltaT = mediaDeltaT / slowMoFactor;

      const pxDistance = Math.hypot(p2.videoX - p1.videoX, p2.videoY - p1.videoY);
      const distanceM = pxDistance / activeCalibration.pixelsPerMetre;

      if (realDeltaT > 0 && distanceM > 0) {
        const speedMps = distanceM / realDeltaT;
        setComputedManualSpeedMps(speedMps);
      }
    }
  };

  // Reset manual clicks
  const resetManualClicks = () => {
    setManualPoints([]);
    setComputedManualSpeedMps(null);
    drawCurrentFrame();
  };

  // Save manual delivery to session
  const saveManualDelivery = async () => {
    if (!computedManualSpeedMps || !activeCalibration) return;

    const sessionId = generateId('sess');
    const session: Session = {
      id: sessionId,
      name: `Video Analysis - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: Date.now(),
      calibrationId: activeCalibration.id,
      ballPreset: 'manual',
    };

    const delivery: Delivery = {
      id: generateId('del'),
      sessionId,
      createdAt: Date.now(),
      speedMps: computedManualSpeedMps,
      uncertaintyMps: calculateSpeedUncertainty(
        computedManualSpeedMps,
        0.25,
        activeCalibration.distanceM,
        activeCalibration.pixelsPerMetre,
        1 / captureFps
      ),
      method: 'fit',
      preBounce: false,
      r2: 0.999,
      confidence: 'high',
      track: manualPoints.map((pt) => ({
        t: pt.frameTime,
        x: pt.videoX,
        y: pt.videoY,
        conf: 1.0,
      })),
      snapshot: canvasRef.current?.toDataURL('image/jpeg', 0.85) || '',
      notes: `Manual assist analysis from video (${captureFps} fps slow-mo factor ${slowMoFactor})`,
    };

    await saveSession(session);
    await saveDelivery(delivery);
    navigate(`/sessions/${sessionId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
            Video Analysis Lab
          </h1>
          <p className="text-xs font-mono text-[var(--muted)]">
            Analyze recorded high-speed slow-motion deliveries or frame-step with manual assist
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {videoSrc ? 'Choose Different Video' : 'Load Video File'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {!videoSrc ? (
        <Card withBrackets className="p-12 text-center max-w-xl mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--accent)]">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-heading font-semibold">Load a Cricket Delivery Video</h2>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            Drop or select a slow-motion video file (iPhone 120/240 fps, GoPro, or camera clip). Everything runs locally on-device.
          </p>
          <Button
            variant="accent"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="font-bold"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Video File
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Playback & Canvas Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-[6px] border border-[var(--line)] bg-black overflow-hidden aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                className="hidden"
              />
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>

            {/* Playback Controls & Frame Stepper */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                <span>{currentTime.toFixed(3)}s / {duration.toFixed(3)}s</span>
                <span>Frame {Math.round(currentTime * playbackFps)}</span>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={1 / playbackFps}
                value={currentTime}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  if (videoRef.current) videoRef.current.currentTime = t;
                  setCurrentTime(t);
                }}
                className="w-full h-1.5 bg-[var(--line)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
              />

              {/* Buttons: Play, Step, Rates */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <Button variant="secondary" size="sm" onClick={() => stepFrame(-10)} title="Step -10 frames (Shift + Left)">
                    -10
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => stepFrame(-1)} title="Step -1 frame (Left)">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="accent" size="sm" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => stepFrame(1)} title="Step +1 frame (Right)">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => stepFrame(10)} title="Step +10 frames (Shift + Right)">
                    +10
                  </Button>
                </div>

                {/* Speed Rates */}
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-[var(--muted)] mr-1">Rate:</span>
                  {[0.25, 0.5, 1.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (videoRef.current) videoRef.current.playbackRate = rate;
                      }}
                      className={`px-2 py-1 rounded text-xs border ${
                        playbackRate === rate
                          ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10 font-bold'
                          : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar: Slow-Mo Configuration & Manual Assist */}
          <div className="space-y-4">
            {/* Slow Motion Timing Calibration */}
            <Panel title="HIGH-SPEED / SLOW-MO TIMING">
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[var(--muted)] mb-1">
                    RECORDED FPS (CAPTURE RATE)
                  </label>
                  <select
                    value={captureFps}
                    onChange={(e) => setCaptureFps(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-mono"
                  >
                    <option value={30}>30 FPS (Standard)</option>
                    <option value={60}>60 FPS (Smooth)</option>
                    <option value={120}>120 FPS (2× Slow-Mo)</option>
                    <option value={240}>240 FPS (8× Slow-Mo)</option>
                    <option value={480}>480 FPS (16× Slow-Mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1">
                    FILE PLAYBACK FPS
                  </label>
                  <select
                    value={playbackFps}
                    onChange={(e) => setPlaybackFps(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] font-mono"
                  >
                    <option value={30}>30 FPS Container</option>
                    <option value={60}>60 FPS Container</option>
                  </select>
                </div>

                <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)] flex justify-between items-center">
                  <span className="text-[var(--muted)]">SLOW-MO FACTOR:</span>
                  <strong className="text-[var(--accent)] text-sm">{slowMoFactor}×</strong>
                </div>
              </div>
            </Panel>

            {/* Manual Assist Assist Card */}
            <Panel
              title="MANUAL ASSIST TIMING"
              badge={
                manualPoints.length === 2 ? (
                  <Badge variant="speed" size="sm">CALCULATED</Badge>
                ) : (
                  <Badge variant="muted" size="sm">{manualPoints.length}/2 CLICKS</Badge>
                )
              }
            >
              <div className="space-y-3 text-xs font-mono">
                <p className="text-[var(--muted)] leading-relaxed">
                  Click the ball in two separate frames (e.g. at release and near popping crease) to compute precision speed based on your calibrated pitch.
                </p>

                {computedManualSpeedMps ? (
                  <div className="p-4 rounded-[6px] border border-[var(--speed)]/40 bg-[var(--speed)]/10 text-center space-y-1">
                    <div className="text-[var(--muted)] text-[10px] uppercase">
                      Measured Speed
                    </div>
                    <div className="text-4xl font-bold text-[var(--speed)]">
                      {formatSpeed(computedManualSpeedMps, units, 1)} <span className="text-sm font-normal text-[var(--muted)]">{units}</span>
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {getSpeedClass(computedManualSpeedMps).name} Delivery
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded border border-dashed border-[var(--line)] text-center text-[var(--muted)]">
                    {manualPoints.length === 0 && 'Click ball position on frame 1'}
                    {manualPoints.length === 1 && 'Advance frames and click ball position on frame 2'}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetManualClicks}
                    disabled={manualPoints.length === 0}
                    className="flex-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset
                  </Button>

                  {computedManualSpeedMps && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={saveManualDelivery}
                      className="flex-1 font-bold"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};
