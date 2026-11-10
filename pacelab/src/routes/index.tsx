import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  redirect,
  RouteObject,
  ScrollRestoration,
} from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { getLatestCalibration } from '@/db/calibrations';
import { getAllDeliveries } from '@/db/deliveries';
import { getAllSessions, getSession } from '@/db/sessions';
import { AppShell } from '@/layouts/AppShell';
import { FocusLayout } from '@/layouts/FocusLayout';
import { RouteError } from '@/pages/RouteError';

const RouteFallback: React.FC = () => (
  <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <>
        <ScrollRestoration />
        <AppShell />
      </>
    ),
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        handle: { title: 'Dashboard', crumb: 'Dashboard' },
        lazy: () => import('@/pages/Home'),
      },
      {
        path: 'calibrate',
        handle: { title: 'Pitch Calibration', crumb: 'Calibrate' },
        lazy: () => import('@/pages/Calibrate'),
      },
      {
        path: 'analyze',
        handle: { title: 'Video Analysis', crumb: 'Analyze' },
        lazy: () => import('@/pages/Analyze'),
      },
      {
        path: 'sessions',
        handle: { title: 'Recorded Sessions', crumb: 'Sessions' },
        loader: async () => {
          const sessions = await getAllSessions();
          const deliveries = await getAllDeliveries();
          return { sessions, deliveries };
        },
        lazy: () => import('@/pages/Sessions'),
      },
      {
        path: 'sessions/:sessionId',
        handle: { title: 'Session Detail', crumb: 'Session Detail' },
        loader: async ({ params }) => {
          if (!params.sessionId) {
            throw new Response('Session Not Found', { status: 404, statusText: 'Missing session ID' });
          }
          const session = await getSession(params.sessionId);
          if (!session) {
            throw new Response('Session Not Found', {
              status: 404,
              statusText: `Session ${params.sessionId} not found in local IndexedDB.`,
            });
          }
          return { session };
        },
        lazy: () => import('@/pages/SessionDetail'),
      },
      {
        path: 'settings',
        handle: { title: 'Settings', crumb: 'Settings' },
        lazy: () => import('@/pages/Settings'),
      },
      {
        path: 'guide',
        handle: { title: 'Field Setup & Accuracy Guide', crumb: 'Guide' },
        lazy: () => import('@/pages/Guide'),
      },
      {
        path: '*',
        handle: { title: '404 Sector Not Found', crumb: '404' },
        lazy: () => import('@/pages/NotFound'),
      },
    ],
  },
  {
    path: '/live',
    element: (
      <>
        <ScrollRestoration />
        <FocusLayout />
      </>
    ),
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        loader: async () => {
          const latest = await getLatestCalibration();
          if (!latest) {
            return redirect('/calibrate?next=/live');
          }
          return { calibration: latest };
        },
        handle: { title: 'Live Radar', crumb: 'Live' },
        lazy: () => import('@/pages/Live'),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
