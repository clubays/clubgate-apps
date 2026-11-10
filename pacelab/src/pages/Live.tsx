import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraView } from '@/components/camera/CameraView';
import { OverlayCanvas } from '@/components/camera/OverlayCanvas';
import { PermissionGate } from '@/components/camera/PermissionGate';
import { SpeedChart } from '@/components/charts/SpeedChart';
import { DeliveryDrawer } from '@/components/session/DeliveryDrawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { saveSession } from '@/db/sessions';
import { updateDeliveryMetadata, deleteDelivery } from '@/db/deliveries';
import { useCamera } from '@/hooks/useCamera';
import { useCountUp } from '@/hooks/useCountUp';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useTracker } from '@/hooks/useTracker';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useCalibrationStore } from '@/store/calibrationStore';
import { useLiveStore } from '@/store/liveStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Delivery, Session } from '@/types';
import { playArmBeep, triggerHaptic } from '@/utils/audio';
import { generateId } from '@/utils/id';
import { formatSpeed, formatUncertainty, getSpeedClass, convertSpeed } from '@/utils/units';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RotateCcw,
  Square,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

export const Component: React.FC = () => {
  const navigate = useNavigate();
  const live = useLiveStore();
  const settings = useSettingsStore();
  const { activeCalibration, loadActiveFromDB } = useCalibrationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartPanelOpen, setIsChartPanelOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Initialize camera and tracker
  const camera = useCamera({
    autoStart: true,
    resolution: settings.preferredResolution,
    targetFps: settings.targetFps,
  });

  const { measuredFps, resetTracker } = useTracker(camera.videoRef.current);

  // Fullscreen and Wake Lock
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  useWakeLock(true);

  // Ensure active calibration exists or redirect to /calibrate
  useEffect(() => {
    loadActiveFromDB().then((cal) => {
      if (!cal) {
        navigate('/calibrate?next=/live');
      }
    });
  }, [loadActiveFromDB, navigate]);

  // Create session on mount if none active
  useEffect(() => {
    if (!live.currentSession && activeCalibration) {
      const newSession: Session = {
        id: generateId('sess'),
        name: `Live Session - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: Date.now(),
        calibrationId: activeCalibration.id,
        ballPreset: settings.ballPreset,
      };
      live.setSession(newSession);
      saveSession(newSession);
    }
  }, [activeCalibration, live, settings.ballPreset]);

  // Toggle arm with audio/haptic chirp
  const handleToggleArm = () => {
    const nextState = !live.isArmed;
    live.setArmed(nextState);
    if (nextState && !live.isMuted) {
      playArmBeep();
      triggerHaptic(60);
    }
  };

  // Keyboard hotkeys: Space, R, G, M, F
  useHotkeys({
    ' ': () => handleToggleArm(),
    r: () => resetTracker(),
    g: () => live.toggleGates(),
    m: () => live.toggleMute(),
    f: () => toggleFullscreen(),
  });

  // End session and view details
  const handleEndSession = async () => {
    if (live.currentSession) {
      navigate(`/sessions/${live.currentSession.id}`);
    } else {
      navigate('/sessions');
    }
  };

  // Speed readout animated count-up
  const lastSpeedVal = live.lastDelivery ? convertSpeed(live.lastDelivery.speedMps, settings.units) : 0;
  const countedSpeed = useCountUp(lastSpeedVal, 600, 1);
  const speedClass = live.lastDelivery ? getSpeedClass(live.lastDelivery.speedMps) : null;
  const formattedUncertainty = live.lastDelivery
    ? formatUncertainty(live.lastDelivery.uncertaintyMps, settings.units, 1)
    : '';

  // State Chip Color
  const stateColor = {
    IDLE: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]',
    ARMED: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 animate-pulse',
    TRACKING: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    CAPTURED: 'bg-lime-500/20 text-lime-400 border-lime-500/50 shadow-[0_0_15px_rgba(163,230,53,0.3)]',
    COOLDOWN: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  }[live.state];

  // Recent 5 deliveries
  const recentDeliveries = [...live.sessionDeliveries].reverse().slice(0, 5);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black text-[var(--text)] select-none font-sans"
    >
      {/* 1. Camera Video Feed */}
      <PermissionGate
        hasPermission={camera.hasPermission}
        error={camera.error}
        isLoading={camera.isLoading}
        onRetry={camera.startCamera}
      >
        <CameraView videoRef={camera.videoRef} objectFit="contain" />
      </PermissionGate>

      {/* 2. Optical Trajectory and Gate Overlay Canvas */}
      <OverlayCanvas
        calibration={activeCalibration}
        state={live.state}
        showGates={live.showGates}
        activeCandidate={live.activeCandidate}
        activeTrack={live.activeTrack}
        videoWidth={camera.actualSettings?.width || 1280}
        videoHeight={camera.actualSettings?.height || 720}
      />

      {/* 3. Top HUD Bar */}
      <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between pointer-events-none z-30">
        {/* Left: Telemetry Details */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-black/65 backdrop-blur-md border border-white/10 font-mono text-xs">
          <span className="text-[var(--speed)] font-bold">{measuredFps} FPS</span>
          <span className="text-[var(--muted)]">•</span>
          <span className="text-[var(--muted)]">proc {live.procMs.toFixed(1)}ms</span>
          {camera.actualSettings && (
            <>
              <span className="text-[var(--muted)] hidden sm:inline">•</span>
              <span className="text-[var(--muted)] hidden sm:inline">
                {camera.actualSettings.width}×{camera.actualSettings.height}
              </span>
            </>
          )}
        </div>

        {/* Center: Live State Chip */}
        <div className="pointer-events-auto">
          <div
            className={`px-4 py-1.5 rounded-[4px] font-mono text-xs font-bold tracking-widest uppercase border ${stateColor}`}
          >
            {live.state}
          </div>
        </div>

        {/* Right: Quick Controls (Gates, Mute, Fullscreen, Chart) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => live.toggleGates()}
            title="Toggle Gate Lines (G)"
            className="p-2 rounded-[4px] bg-black/65 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:border-[var(--accent)] cursor-pointer"
          >
            {live.showGates ? <Eye className="w-4 h-4 text-[var(--accent)]" /> : <EyeOff className="w-4 h-4 text-[var(--muted)]" />}
          </button>

          <button
            onClick={() => live.toggleMute()}
            title="Toggle Mute (M)"
            className="p-2 rounded-[4px] bg-black/65 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:border-[var(--accent)] cursor-pointer"
          >
            {live.isMuted ? <VolumeX className="w-4 h-4 text-[var(--danger)]" /> : <Volume2 className="w-4 h-4 text-[var(--speed)]" />}
          </button>

          <button
            onClick={() => toggleFullscreen()}
            title="Toggle Fullscreen (F)"
            className="p-2 rounded-[4px] bg-black/65 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:border-[var(--accent)] cursor-pointer hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsChartPanelOpen(!isChartPanelOpen)}
            title="Toggle Session Speed Chart"
            className="p-2 rounded-[4px] bg-black/65 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:border-[var(--accent)] cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isChartPanelOpen ? 'text-[var(--speed)]' : ''}`} />
          </button>
        </div>
      </header>

      {/* 4. Giant Speed Readout (Screen Center) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <div className="flex flex-col items-center select-none">
          <div
            aria-live="polite"
            className="font-mono font-bold tracking-tighter text-[var(--speed)] leading-none drop-shadow-[0_0_24px_rgba(163,230,53,0.35)]"
            style={{ fontSize: 'clamp(72px, 14vw, 168px)' }}
          >
            {countedSpeed}
          </div>

          <div className="flex items-center gap-2.5 -mt-1 sm:mt-1">
            <span className="font-mono text-sm sm:text-lg font-bold text-[var(--muted)] tracking-wider">
              {settings.units}
            </span>
            {formattedUncertainty && (
              <span className="font-mono text-xs sm:text-sm text-[var(--muted)] font-medium">
                {formattedUncertainty}
              </span>
            )}
            {speedClass && (
              <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded border ${speedClass.badgeClass}`}>
                {speedClass.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bottom HUD: Recent Delivery Chips & Thumb Control Bar */}
      <footer className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 flex flex-col gap-3 pointer-events-none z-30 pb-[max(12px,env(safe-area-inset-bottom))]">
        {/* Recent Deliveries Chips */}
        {recentDeliveries.length > 0 && (
          <div className="pointer-events-auto flex items-center justify-center gap-2 overflow-x-auto py-1">
            {recentDeliveries.map((del, idx) => {
              const sc = getSpeedClass(del.speedMps);
              return (
                <button
                  key={del.id}
                  onClick={() => setSelectedDelivery(del)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-black/75 backdrop-blur-md border border-white/15 hover:border-[var(--speed)] text-xs font-mono cursor-pointer transition-all shadow-md"
                >
                  <span className="text-[var(--muted)]">#{live.sessionDeliveries.length - idx}</span>
                  <span className="text-[var(--speed)] font-bold">
                    {formatSpeed(del.speedMps, settings.units, 1)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Primary Controls Bar */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 max-w-xl mx-auto w-full px-2">
          {/* Reset / Clear */}
          <Button
            variant="ghost"
            size="md"
            onClick={resetTracker}
            title="Reset tracking state (R)"
            className="bg-black/60 border border-white/10 text-white hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>

          {/* Big Thumb-Friendly ARM / DISARM Button */}
          <Button
            variant={live.isArmed ? 'accent' : 'primary'}
            size="lg"
            onClick={handleToggleArm}
            className={`min-w-[160px] sm:min-w-[200px] h-13 text-base sm:text-lg font-bold font-mono tracking-wider shadow-xl ${
              live.isArmed
                ? 'bg-[var(--speed)] text-[#05080c] ring-4 ring-[var(--speed)]/30'
                : 'bg-[var(--accent)] text-[#05080c]'
            }`}
          >
            {live.isArmed ? 'DISARM (SPACE)' : 'ARM RADAR'}
          </Button>

          {/* End Session Button */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleEndSession}
            className="bg-black/60 border border-white/10 text-white hover:border-[var(--accent)]"
          >
            <Square className="w-3.5 h-3.5 mr-1.5 fill-current text-[var(--warn)]" />
            Finish
          </Button>
        </div>
      </footer>

      {/* 6. Collapsible Live Speed Chart Side Panel */}
      {isChartPanelOpen && (
        <aside
          role="complementary"
          aria-label="Live session speed chart"
          className="absolute top-16 right-3 sm:right-5 w-80 sm:w-96 rounded-[6px] border border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md p-4 shadow-2xl z-40 animate-in slide-in-from-right-4 duration-200"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line)]">
            <div className="font-mono text-xs font-semibold text-[var(--text)]">
              LIVE SESSION TRAJECTORY ({live.sessionDeliveries.length} BALLS)
            </div>
            <button
              onClick={() => setIsChartPanelOpen(false)}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <SpeedChart
            deliveries={live.sessionDeliveries}
            units={settings.units}
            height={200}
            onSelectDelivery={(d) => setSelectedDelivery(d)}
          />
        </aside>
      )}

      {/* 7. Delivery Detail Drawer */}
      <DeliveryDrawer
        delivery={selectedDelivery}
        isOpen={selectedDelivery !== null}
        units={settings.units}
        onClose={() => setSelectedDelivery(null)}
        onSaveMetadata={async (id, updates) => {
          await updateDeliveryMetadata(id, updates);
        }}
        onDelete={async (id) => {
          await deleteDelivery(id);
          setSelectedDelivery(null);
        }}
      />
    </div>
  );
};
