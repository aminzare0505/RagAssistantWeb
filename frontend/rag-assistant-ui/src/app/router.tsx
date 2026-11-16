import { createBrowserRouter, type RouteObject } from 'react-router';

import { AuthLayout, LoginPage, RequireAuth } from '@/features/auth';
import { AppShell } from '@/layouts/app-shell';
import { HomePage } from '@/pages/home-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';
import { RouteLoading } from '@/pages/route-loading';

const hydrateFallbackElement = <RouteLoading />;

export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/',
            element: <AppShell />,
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, element: <HomePage /> },
              {
                path: 'chat',
                hydrateFallbackElement,
                lazy: async () => {
                  const { ChatPage } = await import('@/features/chat');
                  return { Component: ChatPage };
                },
              },
              {
                path: 'documents',
                hydrateFallbackElement,
                lazy: async () => {
                  const { DocumentsPage } = await import('@/features/documents');
                  return { Component: DocumentsPage };
                },
              },
              {
                path: 'data-sources',
                hydrateFallbackElement,
                lazy: async () => {
                  const { DataSourcesPage } = await import('@/features/data-sources');
                  return { Component: DataSourcesPage };
                },
              },
              {
                path: 'settings',
                hydrateFallbackElement,
                lazy: async () => {
                  const { SettingsPage } = await import('@/features/settings');
                  return { Component: SettingsPage };
                },
              },
              {
                path: 'design-system',
                hydrateFallbackElement,
                lazy: async () => {
                  const { DesignSystemPage } = await import('@/pages/design-system-page');
                  return { Component: DesignSystemPage };
                },
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
