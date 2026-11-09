import { Link } from 'react-router';
import { useClubgate } from '../context/ClubgateContext';
import Avatar from '../components/Avatar';
import { SCOPE_LABELS } from '../lib/messages';

export default function Home() {
  const { user, status } = useClubgate();
  return (
    <>
      <section className="hero">
        <Avatar src={user.profileimage} name={user.name} size={88} />
        <div>
          <h1>Hello, {user.name}</h1>
          <p className="muted">@{user.username}</p>
        </div>
      </section>

      <section className="panel">
        <h2>This app can see</h2>
        <ul className="chips">
          {status.scopes.map((s) => (
            <li key={s}>{SCOPE_LABELS[s] ?? s}</li>
          ))}
        </ul>
        <p className="muted">
          <Link to="/connection">Manage connection</Link>
        </p>
      </section>
    </>
  );
}
