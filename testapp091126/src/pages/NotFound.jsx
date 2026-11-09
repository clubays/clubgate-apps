import { Link } from "react-router";

export default function NotFound() {
  return (
    <>
      <h3>Page not found</h3>
      <Link to="/">Go home</Link>
    </>
  );
}
