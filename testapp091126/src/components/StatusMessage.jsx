import { errorText } from '../lib/messages';

export default function StatusMessage({ code, onRetry }) {
  return (
    <div className="center" role="alert">
      <h2>Couldn’t load this app</h2>
      <p className="muted">{errorText(code)}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}
