import { NavLink, Outlet } from 'react-router';
import { useClubgate } from '../context/ClubgateContext';
import Avatar from './Avatar';
import Spinner from './Spinner';
import StatusMessage from './StatusMessage';
import ConnectGate from './ConnectGate';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/profile', label: 'Profile' },
  { to: '/connection', label: 'Connection' },
];

export default function Layout() {
  const { loading, error, linked, user, refresh } = useClubgate();

  let body;
  if (loading) body = <Spinner />;
  else if (error && !linked && error !== 'consent_declined')
    body = <StatusMessage code={error} onRetry={refresh} />;
  else if (!linked) body = <ConnectGate />;
  else body = <Outlet />;

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Test app</span>
        {linked && (
          <>
            <nav className="nav" aria-label="Main">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
              ))}
            </nav>
            <Avatar src={user?.profileimage} name={user?.name} size={32} />
          </>
        )}
      </header>
      <main className="content">{body}</main>
    </div>
  );
}
