import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Image as ImageIcon, Share2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import HeightChart from '../components/charts/HeightChart.jsx';
import PitchMap from '../components/charts/PitchMap.jsx';
import SessionSpeedChart from '../components/charts/SessionSpeedChart.jsx';
import SpeedChart from '../components/charts/SpeedChart.jsx';
import QualityBadge from '../components/analyze/QualityBadge.jsx';
import SpeedCard from '../components/analyze/SpeedCard.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useSessionsStore } from '../store/useSessionsStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { exportSessionToCSV, exportSessionToJSON, exportShareImage } from '../utils/exportData.js';
import { formatDate } from '../utils/time.js';
import { mpsToKmh, mpsToMph } from '../utils/units.js';

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const loadSession = useSessionsStore((s) => s.loadSession);
  const currentSession = useSessionsStore((s) => s.currentSession);
  const isLoading = useSessionsStore((s) => s.isLoading);

  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  const [selectedBallIdx, setSelectedBallIdx] = useState(0);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  if (isLoading || !currentSession) {
    return (
      <PageShell>
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  const deliveries = currentSession.deliveries || [];
  const selectedDelivery = deliveries[selectedBallIdx] || deliveries[0];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 w-full space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/sessions"
              className="p-2 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#c6ff3d] uppercase tracking-wider">
                  {currentSession.bowler || 'Bowling Session'}
                </span>
                <span className="text-xs text-[#8a9ab0]">• {formatDate(currentSession.date)}</span>
              </div>
              <h1 className="font-condensed text-3xl md:text-4xl font-bold text-[#e8eef5] uppercase">
                {currentSession.name || 'Session Analysis'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => exportSessionToCSV(currentSession)}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => exportSessionToJSON(currentSession)}
            >
              Export JSON
            </Button>
            {selectedDelivery && (
              <Button
                variant="primary"
                size="sm"
                icon={ImageIcon}
                onClick={() => exportShareImage(currentSession, selectedDelivery)}
              >
                Share Image Card
              </Button>
            )}
          </div>
        </div>

        {/* Pitch Map and Session Progression Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PitchMap
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={(idx) => setSelectedBallIdx(idx)}
          />
          <SessionSpeedChart deliveries={deliveries} />
        </div>

        {/* Selected Ball Details Row */}
        {selectedDelivery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <SpeedCard delivery={selectedDelivery} />
              <div className="card-panel p-4 space-y-2 text-xs">
                <span className="font-bold text-[#8a9ab0] uppercase block">Delivery Specs</span>
                <div className="flex justify-between py-1 border-b border-[#243146]">
                  <span className="text-[#8a9ab0]">Length Zone</span>
                  <span className="font-bold text-[#c6ff3d]">
                    {selectedDelivery.metrics?.lengthZone?.name || 'Good length'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#243146]">
                  <span className="text-[#8a9ab0]">Bounce Distance</span>
                  <span className="font-bold text-[#e8eef5]">
                    {selectedDelivery.metrics?.lengthDist != null
                      ? `${selectedDelivery.metrics.lengthDist.toFixed(2)} m from stumps`
                      : 'Full toss'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#243146]">
                  <span className="text-[#8a9ab0]">Bounce Height</span>
                  <span className="font-bold text-[#38bdf8]">
                    {selectedDelivery.metrics?.bounceHeight != null
                      ? `${selectedDelivery.metrics.bounceHeight.toFixed(2)} m`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8a9ab0]">Speed Loss at Pitch</span>
                  <span className="font-bold text-[#ffb020]">
                    {selectedDelivery.metrics?.lossPct != null
                      ? `${selectedDelivery.metrics.lossPct.toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <SpeedChart delivery={selectedDelivery} />
              <HeightChart delivery={selectedDelivery} />
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <div className="card-panel overflow-hidden">
          <div className="p-4 border-b border-[#243146] font-bold text-sm text-[#e8eef5] flex justify-between items-center">
            <span>All Deliveries in Session</span>
            <span className="text-xs text-[#8a9ab0]">{deliveries.length} balls</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eef5]">
              <thead>
                <tr className="border-b border-[#243146] bg-[#0b0f14]/50 text-[#8a9ab0]">
                  <th className="py-2.5 px-4">Ball #</th>
                  <th className="py-2.5 px-4">Release Speed</th>
                  <th className="py-2.5 px-4">Uncertainty</th>
                  <th className="py-2.5 px-4">Speed at Bounce</th>
                  <th className="py-2.5 px-4">Loss %</th>
                  <th className="py-2.5 px-4">Length Zone</th>
                  <th className="py-2.5 px-4">Bounce Height</th>
                  <th className="py-2.5 px-4">Grade</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((del, idx) => {
                  const isSelected = selectedBallIdx === idx;
                  const m = del.metrics || {};
                  const spd = m.speed?.mps ? toUnit(m.speed.mps).toFixed(1) : '—';
                  const sd = m.speed?.sd ? toUnit(m.speed.sd).toFixed(1) : '—';
                  const bnc = m.bounceSpeed?.mps ? toUnit(m.bounceSpeed.mps).toFixed(1) : '—';
                  const loss = m.lossPct != null ? `${m.lossPct.toFixed(1)}%` : '—';
                  const zone = m.lengthZone?.name || '—';
                  const bncH = m.bounceHeight != null ? `${m.bounceHeight.toFixed(2)} m` : '—';

                  return (
                    <tr
                      key={del.id || idx}
                      onClick={() => setSelectedBallIdx(idx)}
                      className={`border-b border-[#243146]/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#182231] font-semibold' : 'hover:bg-[#182231]/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#c6ff3d]">{del.name || `Ball ${idx + 1}`}</td>
                      <td className="py-3 px-4 font-mono font-bold">{spd} {unitLabel}</td>
                      <td className="py-3 px-4 font-mono text-[#8a9ab0]">±{sd}</td>
                      <td className="py-3 px-4 font-mono">{bnc} {unitLabel}</td>
                      <td className="py-3 px-4 font-mono text-[#ffb020]">{loss}</td>
                      <td className="py-3 px-4 font-semibold">{zone}</td>
                      <td className="py-3 px-4 font-mono text-[#38bdf8]">{bncH}</td>
                      <td className="py-3 px-4">
                        <QualityBadge gradeObj={del.grade} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
