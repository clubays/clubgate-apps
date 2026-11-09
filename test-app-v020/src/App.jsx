import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { ClubgateProvider } from './context/ClubgateContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';

const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Connection = lazy(() => import('./pages/Connection'));
const NotFound = lazy(() => import('./pages/NotFound'));

// HashRouter: the app is served from /<version>/ inside the host iframe,
// so hash routes work without any base-path or server rewrite config.
export default function App() {
  return (
    <ClubgateProvider>
      <HashRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="connection" element={<Connection />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ClubgateProvider>
  );
}
