import { useEffect, useState } from "react";
import { clubays, init } from "@clubays/clubgate-sdk";

if (import.meta.env.VITE_HOST_ORIGIN) {
  init({ hostOrigin: import.meta.env.VITE_HOST_ORIGIN });
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([clubays.user.get(), clubays.profile.get()])
      .then(([user, profile]) => setData({ user, profile }))
      .catch((e) => setError(e.code || e.message));
  }, []);

  if (error) return <pre>error: {error}</pre>;
  if (!data) return <p>Loading...</p>;

  return (
    <main style={{ fontFamily: "system-ui", padding: 16 }}>
      <h3>Hello, {data.user.name}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
