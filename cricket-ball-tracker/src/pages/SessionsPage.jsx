import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Search, Trash2, User, Zap, Activity } from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useSessionsStore } from '../store/useSessionsStore.js';
import { exportSessionToCSV, exportSessionToJSON } from '../utils/exportData.js';
import { formatDate } from '../utils/time.js';

export default function SessionsPage() {
  const sessions = useSessionsStore((s) => s.sessions);
  const fetchSessions = useSessionsStore((s) => s.fetchSessions);
  const removeSession = useSessionsStore((s) => s.removeSession);
  const isLoading = useSessionsStore((s) => s.isLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBowler, setSelectedBowler] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Extract unique bowler names
  const bowlerNames = Array.from(
    new Set(sessions.map((s) => s.bowler).filter(Boolean))
  );

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.bowler || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBowler = selectedBowler === 'all' || s.bowler === selectedBowler;
    return matchesSearch && matchesBowler;
  });

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-condensed text-4xl md:text-5xl font-bold tracking-tight text-[#e8eef5] uppercase">
              Saved Bowling Sessions
            </h1>
            <p className="text-sm text-[#8a9ab0] mt-1">
              Locally stored deliveries, speeds, pitch maps, and trajectories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/analyze">
              <Button icon={Plus} variant="primary">
                New Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#121923] border border-[#243146] rounded-xl mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-[#8a9ab0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by session title or bowler name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0b0f14] border border-[#243146] rounded-lg text-xs text-[#e8eef5] focus:outline-hidden focus:border-[#c6ff3d]"
            />
          </div>

          {bowlerNames.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8a9ab0]" />
              <select
                value={selectedBowler}
                onChange={(e) => setSelectedBowler(e.target.value)}
                className="py-2 px-3 bg-[#0b0f14] border border-[#243146] rounded-lg text-xs text-[#e8eef5] focus:outline-hidden"
              >
                <option value="all">All Bowlers</option>
                {bowlerNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((sess) => {
              const deliveryCount = sess.deliveries?.length || 0;
              const speeds = (sess.deliveries || [])
                .map((d) => d.metrics?.speed?.mps)
                .filter(Boolean);
              const maxSpeedKmh = speeds.length > 0 ? Math.max(...speeds) * 3.6 : 0;
              const avgSpeedKmh =
                speeds.length > 0
                  ? (speeds.reduce((a, b) => a + b, 0) / speeds.length) * 3.6
                  : 0;

              return (
                <div
                  key={sess.id}
                  className="card-panel-elevated p-5 flex flex-col justify-between hover:border-[#8a9ab0] transition-colors relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#c6ff3d] uppercase tracking-wider">
                        {sess.bowler || 'Bowler'}
                      </span>
                      <span className="text-[10px] text-[#8a9ab0]">{formatDate(sess.date)}</span>
                    </div>

                    <Link to={`/sessions/${sess.id}`}>
                      <h3 className="font-condensed text-2xl font-bold text-[#e8eef5] hover:text-[#c6ff3d] transition-colors">
                        {sess.name || 'Practice Session'}
                      </h3>
                    </Link>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 my-4 text-center">
                      <div className="p-2 rounded-lg bg-[#0b0f14]">
                        <span className="text-[10px] text-[#8a9ab0] block">BALLS</span>
                        <span className="font-bold text-sm text-[#e8eef5]">{deliveryCount}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0b0f14]">
                        <span className="text-[10px] text-[#8a9ab0] block">TOP SPEED</span>
                        <span className="font-bold text-sm text-[#c6ff3d]">
                          {maxSpeedKmh > 0 ? `${Math.round(maxSpeedKmh)} k` : '—'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0b0f14]">
                        <span className="text-[10px] text-[#8a9ab0] block">AVG SPEED</span>
                        <span className="font-bold text-sm text-[#e8eef5]">
                          {avgSpeedKmh > 0 ? `${Math.round(avgSpeedKmh)} k` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#243146] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportSessionToCSV(sess)}
                        className="px-2 py-1 rounded hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] font-semibold"
                        title="Export CSV"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportSessionToJSON(sess)}
                        className="px-2 py-1 rounded hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] font-semibold"
                        title="Export JSON"
                      >
                        JSON
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/sessions/${sess.id}`}
                        className="font-bold text-[#c6ff3d] hover:underline"
                      >
                        View Details →
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this session from local storage?')) {
                            removeSession(sess.id);
                          }
                        }}
                        className="p-1 rounded text-[#8a9ab0] hover:text-[#e5473f] hover:bg-[#0b0f14]"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center card-panel p-8">
            <Activity className="w-10 h-10 text-[#8a9ab0] mx-auto mb-3" />
            <h3 className="font-condensed text-2xl font-bold text-[#e8eef5] mb-2 uppercase">
              No Saved Sessions
            </h3>
            <p className="text-sm text-[#8a9ab0] max-w-sm mx-auto mb-6">
              Complete an analysis of a bowling video or record live with the speed gun to save sessions here.
            </p>
            <Link to="/analyze">
              <Button icon={Plus} variant="primary">
                Start First Analysis
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
