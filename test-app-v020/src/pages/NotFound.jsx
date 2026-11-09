import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="center">
      <h1>Page not found</h1>
      <p className="muted">That page doesn’t exist in this app.</p>
      <Link className="btn" to="/">Go to Home</Link>
    </div>
  );
}
