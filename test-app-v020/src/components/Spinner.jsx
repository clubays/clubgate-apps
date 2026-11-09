export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="center" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="muted">{label}…</span>
    </div>
  );
}
