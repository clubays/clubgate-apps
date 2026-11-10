import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { GridBackdrop } from '@/components/brand/GridBackdrop';
import { RadarSweep } from '@/components/brand/RadarSweep';
import { DeliveryRow } from '@/components/session/DeliveryRow';
import { DeliveryDrawer } from '@/components/session/DeliveryDrawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Panel } from '@/components/ui/Panel';
import { StatTile } from '@/components/ui/StatTile';
import { getGlobalDeliveryStats, GlobalDeliveryStats, deleteDelivery, updateDeliveryMetadata } from '@/db/deliveries';
import { useCalibrationStore } from '@/store/calibrationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Delivery } from '@/types';
import { formatSpeed } from '@/utils/units';
import {
  Activity,
  Film,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Target,
  Flame,
  Camera,
  ShieldCheck,
} from 'lucide-react';

export const Component: React.FC = () => {
  const navigate = useNavigate();
  const { units } = useSettingsStore();
  const { activeCalibration, loadActiveFromDB } = useCalibrationStore();

  const [stats, setStats] = useState<GlobalDeliveryStats | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    loadActiveFromDB();
    getGlobalDeliveryStats().then(setStats);

    // Check camera permission status
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((status) => {
        setHasCameraPermission(status.state === 'granted');
        status.onchange = () => setHasCameraPermission(status.state === 'granted');
      }).catch(() => {});
    }
  }, [loadActiveFromDB]);

  const topFormatted = stats ? formatSpeed(stats.topSpeedMps, units, 1) : '--.-';
  const avgFormatted = stats ? formatSpeed(stats.avgSpeedMps, units, 1) : '--.-';

  const handleSaveMetadata = async (id: string, updates: { bowler?: string; notes?: string }) => {
    await updateDeliveryMetadata(id, updates);
    const updated = await getGlobalDeliveryStats();
    setStats(updated);
  };

  const handleDeleteDelivery = async (id: string) => {
    await deleteDelivery(id);
    const updated = await getGlobalDeliveryStats();
    setStats(updated);
    setSelectedDelivery(null);
  };

  return (
    <div className="relative min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <GridBackdrop />

      {/* Hero Section */}
      <div className="relative rounded-[6px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
        <CornerBrackets size={16} />

        <div className="max-w-xl space-y-4 z-10 text-center lg:text-left">
          <Badge variant="speed" size="md">
            ON-DEVICE HIGH SPEED RADAR
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-[var(--text)]">
            Measure every ball.
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            High-precision cricket ball speed tracking running entirely on your phone or laptop.
            Sub-frame gate timing, 2D Kalman motion filters, and zero cloud uploads.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/live')}
              className="text-[#05080c] font-bold"
            >
              <Activity className="w-5 h-5 mr-1 text-[#05080c]" />
              Start Live Tracking
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/analyze')}
            >
              <Film className="w-5 h-5 mr-1" />
              Analyze Video
            </Button>
          </div>
        </div>

        {/* Animated Radar Visual */}
        <div className="relative flex items-center justify-center flex-shrink-0 z-10">
          <RadarSweep size={280} />
        </div>
      </div>

      {/* Telemetry Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Total Deliveries Tracked"
          value={stats ? stats.totalCount : 0}
          unit="balls"
          subtext="Persisted in local IndexedDB"
          icon={<Flame className="w-4 h-4 text-[var(--warn)]" />}
        />

        <StatTile
          label="Top Speed Recorded"
          value={topFormatted}
          unit={units}
          variant="speed"
          subtext="Fastest confirmed gate crossing"
          icon={<Zap className="w-4 h-4 text-[var(--speed)]" />}
        />

        <StatTile
          label="Rolling Average Speed"
          value={avgFormatted}
          unit={units}
          variant="accent"
          subtext={stats ? `${stats.weekCount} deliveries this week` : 'Calculating...'}
          icon={<Target className="w-4 h-4 text-[var(--accent)]" />}
        />
      </div>

      {/* Setup Checklist & Recent Deliveries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Checklist */}
        <Panel
          title="SETUP CHECKLIST"
          badge={
            activeCalibration ? (
              <Badge variant="speed" size="sm">READY</Badge>
            ) : (
              <Badge variant="warn" size="sm">ACTION REQ</Badge>
            )
          }
          className="lg:col-span-1 flex flex-col justify-between"
        >
          <div className="space-y-3 font-mono text-xs">
            {/* Checklist Item 1: Pitch Calibration */}
            <div className="flex items-start justify-between p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-start gap-2.5">
                {activeCalibration ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--speed)] mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[var(--warn)] mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-[var(--text)]">Pitch Calibration</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {activeCalibration
                      ? `${activeCalibration.label} (${activeCalibration.distanceM}m)`
                      : 'No gate calibration saved'}
                  </div>
                </div>
              </div>
              <Link
                to="/calibrate"
                className="text-[var(--accent)] hover:underline flex items-center gap-0.5 text-[11px]"
              >
                {activeCalibration ? 'Edit' : 'Setup'}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Checklist Item 2: Camera Permission */}
            <div className="flex items-start justify-between p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-start gap-2.5">
                {hasCameraPermission ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--speed)] mt-0.5 flex-shrink-0" />
                ) : (
                  <Camera className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-[var(--text)]">Camera Authorization</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {hasCameraPermission ? 'Browser access granted' : 'Requested during live tracking'}
                  </div>
                </div>
              </div>
              <Link
                to="/settings"
                className="text-[var(--accent)] hover:underline flex items-center gap-0.5 text-[11px]"
              >
                Test
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Checklist Item 3: Hardware Capture Rate */}
            <div className="flex items-start justify-between p-3 rounded bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--speed)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--text)]">Sub-Frame Interpolator</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    Active for 30, 60, and 120 fps video
                  </div>
                </div>
              </div>
              <Link
                to="/guide"
                className="text-[var(--accent)] hover:underline flex items-center gap-0.5 text-[11px]"
              >
                Guide
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Security: On-Device Only</span>
            <ShieldCheck className="w-4 h-4 text-[var(--speed)]" />
          </div>
        </Panel>

        {/* Recent Deliveries List */}
        <Panel
          title="RECENT DELIVERIES"
          badge={
            <span className="text-xs font-mono text-[var(--muted)]">
              {stats?.recentDeliveries.length || 0} shown
            </span>
          }
          actions={
            <Link to="/sessions" className="text-xs font-mono text-[var(--accent)] hover:underline">
              View All Sessions →
            </Link>
          }
          className="lg:col-span-2"
        >
          {stats && stats.recentDeliveries.length > 0 ? (
            <div className="space-y-2">
              {stats.recentDeliveries.map((del, idx) => (
                <DeliveryRow
                  key={del.id}
                  index={idx + 1}
                  delivery={del}
                  units={units}
                  onClick={() => setSelectedDelivery(del)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-[var(--line)] rounded-[6px] text-xs font-mono text-[var(--muted)] space-y-3">
              <p>NO DELIVERIES RECORDED YET</p>
              <Button variant="accent" size="sm" onClick={() => navigate('/live')}>
                Start Your First Session
              </Button>
            </div>
          )}
        </Panel>
      </div>

      {/* Delivery Inspect Drawer */}
      <DeliveryDrawer
        delivery={selectedDelivery}
        isOpen={selectedDelivery !== null}
        units={units}
        onClose={() => setSelectedDelivery(null)}
        onSaveMetadata={handleSaveMetadata}
        onDelete={handleDeleteDelivery}
      />
    </div>
  );
};
