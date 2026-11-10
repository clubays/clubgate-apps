import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { SessionCard } from '@/components/session/SessionCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { deleteSession, getAllSessions } from '@/db/sessions';
import { getAllDeliveries } from '@/db/deliveries';
import { useSettingsStore } from '@/store/settingsStore';
import { Delivery, Session } from '@/types';
import { Search, Plus, Trash2, ArrowUpDown, History } from 'lucide-react';

export interface SessionsLoaderData {
  sessions: Session[];
  deliveries: Delivery[];
}

export const Component: React.FC = () => {
  const navigate = useNavigate();
  const { units } = useSettingsStore();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'topSpeed'>('date');
  const [deleteCandidate, setDeleteCandidate] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    const s = await getAllSessions();
    const d = await getAllDeliveries();
    setSessions(s);
    setDeliveries(d);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map session deliveries
  const getDeliveriesFor = (sessionId: string) => {
    return deliveries.filter((d) => d.sessionId === sessionId);
  };

  // Filter & Sort
  const filteredSessions = sessions
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.bowler && s.bowler.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'topSpeed') {
        const delsA = getDeliveriesFor(a.id);
        const delsB = getDeliveriesFor(b.id);
        const topA = delsA.length > 0 ? Math.max(...delsA.map((d) => d.speedMps)) : 0;
        const topB = delsB.length > 0 ? Math.max(...delsB.map((d) => d.speedMps)) : 0;
        return topB - topA;
      }
      return b.createdAt - a.createdAt; // newest first
    });

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    await deleteSession(deleteCandidate.id);
    await loadData();
    setIsDeleting(false);
    setDeleteCandidate(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text)]">
            Recorded Sessions
          </h1>
          <p className="text-xs font-mono text-[var(--muted)]">
            Browse and compare historical bowling spells, speeds, and consistency
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => navigate('/live')}
          className="font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Start New Spell
        </Button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by session title or bowler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)] font-mono focus:outline-hidden focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--muted)] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <button
            onClick={() => setSortBy('date')}
            className={`px-2.5 py-1.5 rounded-[4px] border transition-colors ${
              sortBy === 'date'
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold'
                : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Date (Newest)
          </button>
          <button
            onClick={() => setSortBy('topSpeed')}
            className={`px-2.5 py-1.5 rounded-[4px] border transition-colors ${
              sortBy === 'topSpeed'
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold'
                : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Top Speed
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              deliveries={getDeliveriesFor(session.id)}
              units={units}
              onDelete={(s) => setDeleteCandidate(s)}
            />
          ))}
        </div>
      ) : (
        <Card withBrackets className="p-12 text-center max-w-md mx-auto my-12 space-y-3">
          <History className="w-10 h-10 text-[var(--muted)] mx-auto opacity-50" />
          <h3 className="font-heading font-semibold text-base">No Sessions Found</h3>
          <p className="text-xs text-[var(--muted)]">
            {searchQuery ? 'Try adjusting your search filter.' : 'Start a live tracking session or analyze a video to log your bowling spells.'}
          </p>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteCandidate !== null}
        onClose={() => setDeleteCandidate(null)}
        title="Delete Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Session & Deliveries
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--muted)]">
          Are you sure you want to delete <strong className="text-[var(--text)]">{deleteCandidate?.name}</strong>?
          This will permanently remove all recorded deliveries and snapshots associated with this spell from your local device.
        </p>
      </Modal>
    </div>
  );
};
