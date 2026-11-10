import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { Segmented } from '@/components/ui/Segmented';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { BALL_PRESETS } from '@/constants';
import { clearAllDatabaseData, getAllDeliveries } from '@/db/deliveries';
import { getAllSessions } from '@/db/sessions';
import { getAllCalibrations } from '@/db/calibrations';
import { useCamera } from '@/hooks/useCamera';
import { useSettingsStore } from '@/store/settingsStore';
import { downloadJson } from '@/utils/download';
import {
  Volume2,
  Vibrate,
  Mic,
  Camera,
  Trash2,
  Download,
  CheckCircle2,
  Palette,
  Sun,
  Moon,
  Activity,
  Sliders,
} from 'lucide-react';

export const Component: React.FC = () => {
  const settings = useSettingsStore();

  // Test Camera state
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const testCam = useCamera({
    preferredDeviceId: settings.preferredCameraId,
    resolution: settings.preferredResolution,
    targetFps: settings.targetFps,
    autoStart: false,
  });

  // Clear data confirmation modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Test Camera
  const handleTestCamera = async () => {
    if (isTestingCamera) {
      testCam.stopCamera();
      setIsTestingCamera(false);
    } else {
      setIsTestingCamera(true);
      await testCam.startCamera();
    }
  };

  // Export all IndexedDB data
  const handleExportAllData = async () => {
    const sessions = await getAllSessions();
    const deliveries = await getAllDeliveries();
    const calibrations = await getAllCalibrations();

    const fullDump = {
      exportedAt: new Date().toISOString(),
      settings: {
        units: settings.units,
        theme: settings.theme,
        ballPreset: settings.ballPreset,
      },
      calibrations,
      sessions,
      deliveries,
    };

    downloadJson(fullDump, `pacelab_backup_${Date.now()}.json`);
  };

  // Clear all IndexedDB data
  const handleClearAllData = async () => {
    setIsClearing(true);
    await clearAllDatabaseData();
    setIsClearing(false);
    setIsClearModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
          Instrument Configuration
        </h1>
        <p className="text-xs font-mono text-[var(--muted)]">
          Hardware negotiation, detection filters, audio annunciators, and data management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. General Preferences & Units */}
        <Panel title="MEASUREMENT UNITS & DISPLAY">
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[var(--muted)] mb-1.5">SPEED UNITS</label>
              <Segmented
                value={settings.units}
                onChange={settings.setUnits}
                options={[
                  { value: 'km/h', label: 'KM/H (Metric)' },
                  { value: 'mph', label: 'MPH (Imperial)' },
                  { value: 'm/s', label: 'M/S (SI)' },
                ]}
                className="w-full justify-between"
              />
            </div>

            <div>
              <label className="block text-[var(--muted)] mb-1.5">INTERFACE THEME</label>
              <Segmented
                value={settings.theme}
                onChange={settings.setTheme}
                options={[
                  { value: 'night', label: 'NIGHT (HUD Glow)' },
                  { value: 'day', label: 'DAY (Outdoor High-Contrast)' },
                ]}
                className="w-full justify-between"
              />
            </div>
          </div>
        </Panel>

        {/* 2. Ball Presets & Color Masking */}
        <Panel title="CRICKET BALL DETECTION FILTER">
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[var(--muted)] mb-1.5">BALL COLOR PRESET</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BALL_PRESETS.map((p) => {
                  const isSelected = settings.ballPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => settings.setBallPreset(p.id)}
                      className={`flex items-center gap-2 p-2 rounded-[4px] border text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/15 font-semibold text-[var(--text)]'
                          : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40 flex-shrink-0"
                        style={{ backgroundColor: p.colorHex }}
                      />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom HSV Controls if Custom selected */}
            {settings.ballPreset === 'custom' && (
              <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--line)] space-y-3">
                <Slider
                  label="Hue Min"
                  value={settings.customHsv.hMin}
                  min={0}
                  max={360}
                  valueDisplay={`${settings.customHsv.hMin}°`}
                  onChange={(v) => settings.setCustomHsv({ ...settings.customHsv, hMin: v })}
                />
                <Slider
                  label="Hue Max"
                  value={settings.customHsv.hMax}
                  min={0}
                  max={360}
                  valueDisplay={`${settings.customHsv.hMax}°`}
                  onChange={(v) => settings.setCustomHsv({ ...settings.customHsv, hMax: v })}
                />
              </div>
            )}
          </div>
        </Panel>

        {/* 3. Audio & Haptics Annunciators */}
        <Panel title="HUD AUDIO & HAPTIC ANNUNCIATORS">
          <div className="space-y-4">
            <Toggle
              checked={settings.beep}
              onChange={settings.setBeep}
              label="Synthesized Audio Beep"
              description="Chirp tones upon radar arming and delivery capture"
            />

            <Toggle
              checked={settings.vibration}
              onChange={settings.setVibration}
              label="Haptic Pulse"
              description="Tactile vibration buzz on mobile devices upon capture"
            />

            <Toggle
              checked={settings.speech}
              onChange={settings.setSpeech}
              label="Voice Announcer (SpeechSynthesis)"
              description="Speaks measured speed aloud automatically after each ball"
            />
          </div>
        </Panel>

        {/* 4. Tracking Pipeline Sensitivity & Constraints */}
        <Panel title="VISION ENGINE PARAMETERS">
          <div className="space-y-4">
            <Slider
              label="Luma Diff Sensitivity (Lower = more sensitive)"
              value={settings.sensitivity}
              min={10}
              max={50}
              valueDisplay={settings.sensitivity}
              onChange={settings.setSensitivity}
            />

            <Slider
              label="Min Delivery Threshold Speed"
              value={settings.minSpeedKmh}
              min={20}
              max={80}
              valueDisplay={`${settings.minSpeedKmh} km/h`}
              onChange={settings.setMinSpeedKmh}
            />

            <Slider
              label="Capture Cooldown Period"
              value={settings.cooldownSeconds}
              min={1.0}
              max={6.0}
              step={0.5}
              valueDisplay={`${settings.cooldownSeconds}s`}
              onChange={settings.setCooldownSeconds}
            />

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1.5">
                DETECTOR WORKING RESOLUTION
              </label>
              <Segmented
                value={settings.workWidth}
                onChange={(w) => settings.setWorkWidth(w as typeof settings.workWidth)}
                options={[
                  { value: 320, label: '320w (Ultra-Fast)' },
                  { value: 480, label: '480w (Balanced)' },
                  { value: 640, label: '640w (High-Detail)' },
                ]}
                className="w-full justify-between"
              />
            </div>
          </div>
        </Panel>

        {/* 5. Camera Device & Hardware Target */}
        <Panel title="CAMERA HARDWARE CONFIGURATION" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[var(--muted)] mb-1.5">PREFERRED RESOLUTION</label>
              <Segmented
                value={settings.preferredResolution}
                onChange={settings.setPreferredResolution}
                options={[
                  { value: '720p', label: '720p HD' },
                  { value: '1080p', label: '1080p FHD' },
                ]}
                className="w-full justify-between"
              />
            </div>

            <div>
              <label className="block text-[var(--muted)] mb-1.5">TARGET FRAME RATE</label>
              <Segmented
                value={settings.targetFps}
                onChange={(fps) => settings.setTargetFps(fps as typeof settings.targetFps)}
                options={[
                  { value: 30, label: '30 FPS' },
                  { value: 60, label: '60 FPS' },
                  { value: 120, label: '120 FPS' },
                ]}
                className="w-full justify-between"
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button
                variant={isTestingCamera ? 'danger' : 'secondary'}
                onClick={handleTestCamera}
                className="w-full justify-center"
              >
                <Camera className="w-4 h-4 mr-1.5" />
                {isTestingCamera ? 'Stop Hardware Test' : 'Test Camera Hardware'}
              </Button>
            </div>
          </div>

          {/* Test Camera View */}
          {isTestingCamera && (
            <div className="mt-4 p-4 rounded bg-black border border-[var(--line)]">
              <div className="aspect-video max-h-56 mx-auto relative overflow-hidden flex items-center justify-center">
                <video
                  ref={testCam.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              </div>
              {testCam.actualSettings && (
                <div className="mt-2 text-center text-xs font-mono text-[var(--speed)]">
                  Active Feed: {testCam.actualSettings.width} × {testCam.actualSettings.height} @ {testCam.actualSettings.frameRate.toFixed(0)} FPS
                </div>
              )}
            </div>
          )}
        </Panel>

        {/* 6. Local Data & Storage Management */}
        <Panel title="LOCAL STORAGE & DATA RETENTION" className="md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-[var(--muted)] space-y-0.5">
              <div>All calibrations, sessions, and delivery tracks are stored exclusively on this device.</div>
              <div>Nothing is sent across the network.</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={handleExportAllData}>
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Full Backup (JSON)
              </Button>

              <Button variant="danger" size="sm" onClick={() => setIsClearModalOpen(true)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear All Data
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      {/* Clear Database Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All Local PaceLab Data"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAllData} isLoading={isClearing}>
              Erase Everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--muted)]">
          Are you sure you want to completely erase all local calibrations, recorded sessions, and ball trajectories? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
