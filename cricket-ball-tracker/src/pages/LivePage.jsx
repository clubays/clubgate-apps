import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, AlertCircle, RefreshCw, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import ArmButton from '../components/live/ArmButton.jsx';
import LastDeliveryCard from '../components/live/LastDeliveryCard.jsx';
import LiveHud from '../components/live/LiveHud.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getSynthCalibration } from '../functions/synth.js';
import { useCamera } from '../hooks/useCamera.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { useAnalysisWorker } from '../hooks/useAnalysisWorker.js';
import { useAnalysisStore } from '../store/useAnalysisStore.js';
import { useSessionsStore } from '../store/useSessionsStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { nanoid } from '../utils/id.js';

export default function LivePage() {
  const {
    stream,
    error: cameraError,
    actualFps,
    isLowFps,
    startCamera,
    stopCamera,
    tryHigherFps,
  } = useCamera();

  const { requestLock, releaseLock } = useWakeLock();
  const { initWorker, sendFrame, finishAnalysis, resetWorker, onFrameResultRef, onCompleteRef } =
    useAnalysisWorker();

  const calibration = useAnalysisStore((s) => s.calibration);
  const saveCurrentSession = useSessionsStore((s) => s.saveCurrentSession);
  const ballPreset = useSettingsStore((s) => s.ballPreset);
  const units = useSettingsStore((s) => s.units);
  const soundBeep = useSettingsStore((s) => s.soundBeep);
  const setSoundBeep = useSettingsStore((s) => s.setSoundBeep);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isArmed, setIsArmed] = useState(false);
  const [trackerState, setTrackerState] = useState('idle'); // 'idle' | 'tracking' | 'complete'
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [sessionDeliveries, setSessionDeliveries] = useState([]);
  const [isLargeMode, setIsLargeMode] = useState(false);
  const [activeCalib, setActiveCalib] = useState(calibration || null);

  const animFrameRef = useRef(null);
  const frameIdxRef = useRef(0);
  const trackStartTimeRef = useRef(0);
  const lastTrackPointRef = useRef(null);

  // Initialize camera and default calibration if none set
  useEffect(() => {
    startCamera();
    if (!activeCalib) {
      // Default to reference ground calibration if user hasn't calibrated yet
      setActiveCalib(getSynthCalibration());
    }
  }, []);

  // Sync stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.warn);
    }
  }, [stream]);

  // Audio beep
  const playBeep = () => {
    if (!soundBeep) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext blocked
    }
  };

  // Wire worker message callbacks
  useEffect(() => {
    onFrameResultRef.current = (data) => {
      if (data.currentTrackState === 'tracking') {
        setTrackerState('tracking');
      }

      if (data.trackPoint) {
        lastTrackPointRef.current = data.trackPoint;
        // Draw ring on live canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const pt = data.trackPoint;
          const sx = canvas.width / (videoRef.current?.videoWidth || 1280);
          const sy = canvas.height / (videoRef.current?.videoHeight || 720);

          ctx.beginPath();
          ctx.arc(pt.x * sx, pt.y * sy, Math.max(12, (pt.r || 8) * sx), 0, Math.PI * 2);
          ctx.strokeStyle = '#c6ff3d';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pt.x * sx, pt.y * sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#c6ff3d';
          ctx.fill();
        }
      }
    };

    onCompleteRef.current = (data) => {
      setTrackerState('complete');
      if (data.deliveries && data.deliveries.length > 0) {
        const latest = data.deliveries[data.deliveries.length - 1];
        setCurrentDelivery(latest);
        playBeep();

        setSessionDeliveries((prev) => {
          const updated = [...prev, latest];
          // Auto-save to session in IndexedDB
          saveCurrentSession({
            id: `live-session-${Date.now().toString(36)}`,
            name: `Live Session ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString(),
            bowler: 'Live Bowler',
            fps: actualFps,
            deliveries: updated,
          });
          return updated;
        });
      }

      // Automatically reset tracker to arm for next delivery after 1.5s
      setTimeout(() => {
        if (isArmed) {
          resetWorker();
          setTrackerState('idle');
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }, 1500);
    };
  }, [actualFps, isArmed, soundBeep]);

  // Live frame pumping loop
  useEffect(() => {
    if (!isArmed || !videoRef.current) return;

    let isPumping = true;
    requestLock();

    initWorker({
      width: videoRef.current.videoWidth || 1280,
      height: videoRef.current.videoHeight || 720,
      calibration: activeCalib,
      ballPreset,
      workingSize: 480, // Optimized for high real-time throughput
    });

    const pumpFrame = async () => {
      if (!isPumping) return;

      if (videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const bitmap = await createImageBitmap(videoRef.current);
          const t = performance.now() / 1000;
          sendFrame(bitmap, t, frameIdxRef.current++);
        } catch {
          // Skip frame if busy
        }
      }

      animFrameRef.current = requestAnimationFrame(pumpFrame);
    };

    animFrameRef.current = requestAnimationFrame(pumpFrame);

    return () => {
      isPumping = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      releaseLock();
    };
  }, [isArmed, activeCalib, ballPreset]);

  const toggleArm = () => {
    if (!isArmed) {
      frameIdxRef.current = 0;
      setTrackerState('idle');
      setIsArmed(true);
    } else {
      setIsArmed(false);
      setTrackerState('idle');
      finishAnalysis(actualFps);
    }
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c6ff3d] animate-pulse" />
              <span className="text-xs font-bold text-[#c6ff3d] uppercase tracking-wider">
                Instant Radar Speed Gun
              </span>
            </div>
            <h1 className="font-condensed text-3xl md:text-4xl font-bold text-[#e8eef5] uppercase">
              Live Bowling Speed Gun
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundBeep(!soundBeep)}
              className="p-2 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] border border-[#243146]"
              title={soundBeep ? 'Sound ON' : 'Sound MUTED'}
            >
              {soundBeep ? <Volume2 className="w-5 h-5 text-[#c6ff3d]" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsLargeMode(!isLargeMode)}
              className="p-2 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] border border-[#243146]"
              title={isLargeMode ? 'Normal View' : 'Full Pitch Display'}
            >
              {isLargeMode ? <Minimize2 className="w-5 h-5 text-[#c6ff3d]" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Low FPS Warning Banner */}
        {isLowFps && (
          <div className="p-3 bg-[#ffb020]/20 border border-[#ffb020] rounded-xl flex items-center justify-between text-xs text-[#ffb020]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                This camera is running at <strong>{Math.round(actualFps)} fps</strong>. Speeds will be rough (Grade D).
              </span>
            </div>
            <button
              onClick={tryHigherFps}
              className="px-3 py-1 bg-[#ffb020] text-[#0b0f14] font-bold rounded-md hover:brightness-110"
            >
              Try for Higher FPS
            </button>
          </div>
        )}

        {/* Live HUD */}
        <LiveHud
          fps={actualFps}
          trackerState={trackerState}
          recentDeliveries={sessionDeliveries}
          isLargeMode={isLargeMode}
          onToggleLargeMode={() => setIsLargeMode(!isLargeMode)}
        />

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Live Camera Viewport (Left/Top) */}
          <div className={`${isLargeMode ? 'lg:col-span-5' : 'lg:col-span-7'} space-y-4`}>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[#243146] shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none w-full h-full"
              />

              {/* Armed status indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0b0f14]/80 backdrop-blur-xs text-xs font-bold border border-[#243146]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isArmed ? 'bg-[#e5473f] animate-ping' : 'bg-[#8a9ab0]'
                  }`}
                />
                <span>{isArmed ? 'RADAR ACTIVE' : 'DISARMED'}</span>
              </div>
            </div>

            {/* Arm Button */}
            <div className="flex justify-center">
              <ArmButton isArmed={isArmed} onToggle={toggleArm} disabled={!stream} />
            </div>
          </div>

          {/* Last Delivery & Pitch Display (Right) */}
          <div className={`${isLargeMode ? 'lg:col-span-7' : 'lg:col-span-5'} space-y-4`}>
            <LastDeliveryCard delivery={currentDelivery} isLargePitchMode={isLargeMode} />

            {/* Calibration notice / Quick Link */}
            <div className="card-panel p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#e8eef5] block">Camera Pitch Calibration</span>
                <span className="text-[#8a9ab0]">
                  {calibration ? 'Custom pitch calibration active' : 'Using reference side-on geometry'}
                </span>
              </div>
              <Link to="/analyze">
                <Button size="sm" variant="secondary">
                  Calibrate Stumps
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
