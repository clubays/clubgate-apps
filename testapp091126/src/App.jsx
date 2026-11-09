import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { init } from "@clubays/clubgate-sdk";
import RouteSync from "@/components/RouteSync";
import { ClubgateProvider } from "@/context/ClubgateContext";
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";

const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Connection = lazy(() => import("./pages/Connection"));
const NotFound = lazy(() => import("./pages/NotFound"));

if (import.meta.env.VITE_HOST_ORIGIN) {
  init({ hostOrigin: import.meta.env.VITE_HOST_ORIGIN });
}

// HashRouter: the app is served from /<version>/ inside the Clubays iframe,
// so hash routes work without any base-path setup. RouteSync mirrors the
// current route into the Clubays page URL.
export default function App() {
  return (
    <ClubgateProvider>
      <HashRouter>
        <Suspense fallback={<Spinner />}>
          <RouteSync />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connection" element={<Connection />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ClubgateProvider>
  );
}
