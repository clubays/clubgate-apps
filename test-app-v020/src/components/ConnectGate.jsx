import { useClubgate } from '../context/ClubgateContext';
import { errorText } from '../lib/messages';

export default function ConnectGate() {
  const { connect, connecting, error } = useClubgate();
  return (
    <section className="gate">
      <h1>Connect your Clubays account</h1>
      <p className="muted">
        Connecting lets this app show your name, photo and profile. You choose
        what it can see on the next screen, and you can disconnect later.
      </p>
      {error && <p className="error" role="alert">{errorText(error)}</p>}
      <button className="btn btn-primary" onClick={connect} disabled={connecting}>
        {connecting ? 'Waiting for you…' : 'Connect with Clubays'}
      </button>
    </section>
  );
}
