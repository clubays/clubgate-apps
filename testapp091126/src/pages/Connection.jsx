import { useClubgate } from "@/context/ClubgateContext";
import { SCOPE_LABELS } from "@/lib/messages";

export default function Connection() {
  const { status, user } = useClubgate();
  return (
    <section className="panel">
      <h1>Connection</h1>
      <dl className="facts">
        <dt>Status</dt>
        <dd>Connected</dd>
        <dt>App access</dt>
        <dd>
          {status.access === "signin" ? "Sign-in required" : "Open to everyone"}
        </dd>
        <dt>Your app ID</dt>
        <dd className="mono">{user.linkId}</dd>
      </dl>
      <h2>Permissions</h2>
      <ul className="chips">
        {status.scopes.map((s) => (
          <li key={s}>{SCOPE_LABELS[s] ?? s}</li>
        ))}
      </ul>
      <p className="muted">
        To disconnect, remove this app from your Clubays settings.
      </p>
    </section>
  );
}
