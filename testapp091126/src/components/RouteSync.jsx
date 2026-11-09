import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { clubgate } from "@clubays/clubgate-sdk";

// Keeps the Clubays page URL in step with this app's route.
export default function RouteSync() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const current = useRef(pathname + search);

  // app -> host: report every route change
  useEffect(() => {
    current.current = pathname + search;
    clubgate.nav.set(pathname + search).catch(() => {});
  }, [pathname, search]);

  // host -> app: back/forward or a pasted link
  useEffect(
    () =>
      clubgate.nav.onChange((p) => {
        if (p !== current.current) navigate(p);
      }),
    [navigate],
  );

  return null;
}
