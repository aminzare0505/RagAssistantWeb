import { CheckCircle2, ServerOff, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/use-language';
import { env } from '@/lib/env';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="home-title"
        className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent"
        />
        <div className="relative max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles aria-hidden className="size-3.5 text-primary" />
            {t.home.eyebrow}
          </p>
          <h1 id="home-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t.home.title}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {t.home.description}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle id="foundation-title">{t.home.statusTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2" aria-labelledby="foundation-title">
              {t.home.statusItems.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-lg border bg-background/60 p-3"
                >
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-warning/40 bg-warning/5">
          <CardContent>
            <ServerOff aria-hidden className="size-5 text-warning" />
            <h2 className="mt-3 text-base font-semibold">{t.home.backendTitle}</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {t.home.backendDescription}
            </p>
            <dl className="mt-4 space-y-2 border-t pt-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{t.home.apiBaseLabel}</dt>
                <dd dir="ltr" className="truncate font-mono text-foreground">
                  {env.apiBaseUrl || t.home.sameOrigin}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
