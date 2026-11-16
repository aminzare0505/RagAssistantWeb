import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers/app-providers';
import { routes } from '@/app/router';
import { seedSession } from '@/test/auth';

interface RenderAppOptions {
  initialPath?: string;
  /** Seeds an in-memory access token so the app starts signed in. */
  authenticated?: boolean;
}

export function renderApp({ initialPath = '/', authenticated = true }: RenderAppOptions = {}) {
  if (authenticated) {
    seedSession();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });

  return {
    queryClient,
    router,
    ...render(
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}
