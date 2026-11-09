import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clubgate } from "@clubays/clubgate-sdk";
import { errorCode } from "@/lib/messages";

const Ctx = createContext(null);

export const useClubgate = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClubgate must be used inside <ClubgateProvider>");
  return v;
};

async function loadAll() {
  const status = await clubgate.link.status();
  if (!status.linked) return { status, user: null, profile: null };
  const [user, profile] = await Promise.all([
    clubgate.user.get(),
    clubgate.profile.get(),
  ]);
  return { status, user, profile };
}

export function ClubgateProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    status: null,
    user: null,
    profile: null,
    error: null,
  });
  const [connecting, setConnecting] = useState(false);
  const run = useRef(0); // ignore stale responses (StrictMode, fast retries)

  const refresh = useCallback(async () => {
    const id = ++run.current;
    try {
      const data = await loadAll();
      if (id === run.current)
        setState({ loading: false, error: null, ...data });
    } catch (e) {
      if (id === run.current)
        setState((s) => ({ ...s, loading: false, error: errorCode(e) }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setState((s) => ({ ...s, error: null }));
    try {
      await clubgate.link.request(); // host shows the consent screen
      await refresh();
    } catch (e) {
      setState((s) => ({ ...s, error: errorCode(e) }));
    } finally {
      setConnecting(false);
    }
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...state,
      linked: !!state.status?.linked,
      connecting,
      connect,
      refresh,
    }),
    [state, connecting, connect, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
