import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useState, type ReactNode } from 'react';

import { LanguageProvider } from '@/i18n/language-provider';
import { useLanguage } from '@/i18n/use-language';
import { createQueryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/theme/theme-provider';

interface LocalizedProvidersProps {
  children: ReactNode;
}

function LocalizedProviders({ children }: LocalizedProvidersProps) {
  const { dir } = useLanguage();

  return (
    <DirectionProvider dir={dir}>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </DirectionProvider>
  );
}

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());

  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocalizedProviders>
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </LocalizedProviders>
      </LanguageProvider>
    </ThemeProvider>
  );
}
