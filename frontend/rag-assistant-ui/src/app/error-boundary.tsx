import { Component, type ReactNode } from 'react';

import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { en } from '@/i18n/en';
import { fa } from '@/i18n/fa';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // The boundary sits outside the language provider, so it reads the applied locale.
    const t = document.documentElement.lang === 'en' ? en : fa;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-lg font-semibold">{t.errors.unexpectedTitle}</h1>
          <ErrorState
            title={t.errors.unexpectedTitle}
            description={t.errors.unexpectedDescription}
            action={
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => window.location.reload()}>{t.actions.reload}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.assign('/');
                  }}
                >
                  {t.actions.goHome}
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }
}
