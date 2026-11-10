import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { SpeedChart } from '@/components/charts/SpeedChart';
import { DeliveryDrawer } from '@/components/session/DeliveryDrawer';
import { DeliveryRow } from '@/components/session/DeliveryRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { StatTile } from '@/components/ui/StatTile';
import { getCalibration } from '@/db/calibrations';
import { deleteDelivery, getDeliveriesForSession, updateDeliveryMetadata } from '@/db/deliveries';
import { getSession, updateSessionName } from '@/db/sessions';
import { toCSV } from '@/functions/export/toCSV';
import { toJSON } from '@/functions/export/toJSON';
import { useSettingsStore } from '@/store/settingsStore';
import { Calibration, Delivery, Session } from '@/types';
import { downloadCsv, downloadJson } from '@/utils/download';
import { standardDeviation } from '@/utils/math';
import { formatDateTime } from '@/utils/time';
import { formatSpeed } from '@/utils/units';
import {
  Download,
  Edit2,
  Calendar,
  Flame,
  Zap,
  Target,
  ArrowUpDown,
  History,
  TrendingDown,
  Activity,
} from 'lucide-react';

export const Component: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { units } = useSettingsStore();

  const [session, setSession] = useState<Session | null>(null);
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rename modal
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Selected delivery for drawer
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Table Sort
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadSessionData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const sess = await getSession(sessionId);
    if (!sess) {
      setIsLoading(false);
      throw new Response('Session Not Found', { status: 404, statusText: 'The requested bowling session does not exist in local storage.' });
    }
    setSession(sess);
    setRenameValue(sess.name);

    if (sess.calibrationId) {
      const cal = await getCalibration(sess.calibrationId);
      if (cal) setCalibration(cal);
    }

    const dels = await getDeliveriesForSession(sessionId);
    setDeliveries(dels);
    setIsLoading(false);

    // Deep link check: ?delivery=<id>
    const deepDeliveryId = searchParams.get('delivery');
    if (deepDeliveryId) {
      const found = dels.find((d) => d.id === deepDeliveryId);
      if (found) setSelectedDelivery(found);
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  // Sync drawer with URL query param
  const handleOpenDrawer = (d: Delivery) => {
    setSelectedDelivery(d);
    setSearchParams({ delivery: d.id }, { replace: true });
  };

  const handleCloseDrawer = () => {
    setSelectedDelivery(null);
    setSearchParams({}, { replace: true });
  };

  // Stats calculation
  const count = deliveries.length;
  const speedsMps = deliveries.map((d) => d.speedMps);
  const topSpeedMps = count > 0 ? Math.max(...speedsMps) : 0;
  const minSpeedMps = count > 0 ? Math.min(...speedsMps) : 0;
  const avgSpeedMps = count > 0 ? speedsMps.reduce((a, b) => a + b, 0) / count : 0;
  const stdDevMps = count > 1 ? standardDeviation(speedsMps) : 0;

  // Actions
  const handleRename = async () => {
    if (!sessionId || !renameValue.trim()) return;
    await updateSessionName(sessionId, renameValue.trim());
    setSession((prev) => prev ? { ...prev, name: renameValue.trim() } : null);
    setIsRenameOpen(false);
  };

  const handleExportCSV = () => {
    if (!session) return;
    const csv = toCSV(session, deliveries);
    downloadCsv(csv, `${session.name.replace(/\s+/g, '_')}_deliveries.csv`);
  };

  const handleExportJSON = () => {
    if (!session) return;
    const jsonStr = toJSON(session, deliveries, calibration || undefined);
    downloadJson(JSON.parse(jsonStr), `${session.name.replace(/\s+/g, '_')}_data.json`);
  };

  const handleSaveMetadata = async (id: string, updates: { bowler?: string; notes?: string }) => {
    await updateDeliveryMetadata(id, updates);
    await loadSessionData();
  };

  const handleDeleteDelivery = async (id: string) => {
    await deleteDelivery(id);
    await loadSessionData();
    handleCloseDrawer();
  };

  if (isLoading || !session) {
    return <div className="p-8 text-center font-mono text-xs text-[var(--muted)]">LOADING SESSION DATA...</div>;
  }

  const sortedDeliveries = [...deliveries].sort((a, b) => {
    return sortOrder === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
              {session.name}
            </h1>
            <button
              onClick={() => setIsRenameOpen(true)}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              title="Rename session"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(session.createdAt)}
            </span>
            {session.bowler && (
              <>
                <span>•</span>
                <span>Bowler: <strong className="text-[var(--text)]">{session.bowler}</strong></span>
              </>
            )}
            {calibration && (
              <>
                <span>•</span>
                <span>Scale: <strong className="text-[var(--text)]">{calibration.distanceM}m</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>

          <Button variant="secondary" size="sm" onClick={handleExportJSON}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* 5 High-Impact Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile
          label="TOTAL BALLS"
          value={count}
          unit="balls"
          icon={<Flame className="w-4 h-4 text-[var(--warn)]" />}
        />

        <StatTile
          label="TOP SPEED"
          value={formatSpeed(topSpeedMps, units, 1)}
          unit={units}
          variant="speed"
          icon={<Zap className="w-4 h-4 text-[var(--speed)]" />}
        />

        <StatTile
          label="AVERAGE SPEED"
          value={formatSpeed(avgSpeedMps, units, 1)}
          unit={units}
          variant="accent"
          icon={<Target className="w-4 h-4 text-[var(--accent)]" />}
        />

        <StatTile
          label="MIN SPEED"
          value={formatSpeed(minSpeedMps, units, 1)}
          unit={units}
          icon={<TrendingDown className="w-4 h-4 text-[var(--muted)]" />}
        />

        <StatTile
          label="STD DEVIATION"
          value={formatSpeed(stdDevMps, units, 1)}
          unit={units}
          subtext="Pace consistency spread"
          icon={<Activity className="w-4 h-4 text-[var(--accent)]" />}
        />
      </div>

      {/* Charts Section: Speed Timeline & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="DELIVERY PACE TIMELINE">
          <SpeedChart
            deliveries={deliveries}
            units={units}
            height={240}
            onSelectDelivery={handleOpenDrawer}
          />
        </Panel>

        <Panel title="PACE DISTRIBUTION SPREAD">
          <DistributionChart
            deliveries={deliveries}
            units={units}
            height={240}
          />
        </Panel>
      </div>

      {/* Delivery Log Table */}
      <Panel
        title={`DELIVERY LOG (${deliveries.length} BALLS)`}
        actions={
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 text-xs font-mono text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Order: {sortOrder === 'asc' ? 'Chronological' : 'Reverse'}</span>
          </button>
        }
      >
        {sortedDeliveries.length > 0 ? (
          <div className="space-y-2">
            {sortedDeliveries.map((del, idx) => (
              <DeliveryRow
                key={del.id}
                index={sortOrder === 'asc' ? idx + 1 : deliveries.length - idx}
                delivery={del}
                units={units}
                onClick={() => handleOpenDrawer(del)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs font-mono text-[var(--muted)] border border-dashed border-[var(--line)] rounded-[6px]">
            NO DELIVERIES IN THIS SESSION
          </div>
        )}
      </Panel>

      {/* Delivery Detail Slide-Over Drawer */}
      <DeliveryDrawer
        delivery={selectedDelivery}
        isOpen={selectedDelivery !== null}
        units={units}
        onClose={handleCloseDrawer}
        onSaveMetadata={handleSaveMetadata}
        onDelete={handleDeleteDelivery}
      />

      {/* Rename Modal */}
      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleRename}>
              Save Name
            </Button>
          </>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <label className="block text-[var(--muted)]">SESSION TITLE</label>
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] font-mono"
          />
        </div>
      </Modal>
    </div>
  );
};
