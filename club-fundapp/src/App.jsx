import { useEffect, useState } from "react";
import { clubays, init } from "@clubays/clubgate-sdk";
import "./App.css";

import { HomePage } from "./pages";

if (import.meta.env.VITE_HOST_ORIGIN) {
  init({ hostOrigin: import.meta.env.VITE_HOST_ORIGIN });
}

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([clubays.user.get(), clubays.profile.get()])
      .then(([u, p]) => {
        setUser(u);
        setProfile(p);
      })
      .catch((e) => setError(e.code || e.message));
  }, []);

  if (error) return <pre>error: {error}</pre>;
  return (
    <>
      <HomePage user={user} profile={profile} />
    </>
  );
}

export default App;
