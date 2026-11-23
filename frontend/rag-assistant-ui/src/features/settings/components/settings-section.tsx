import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsSectionProps {
  title: string;
  description: string;
  previewBadge?: string;
  previewNotice?: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  previewBadge,
  previewNotice,
  children,
}: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {previewBadge ? (
            <Badge tone="warning">
              <Info aria-hidden className="size-3" />
              {previewBadge}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      {previewNotice ? (
        <div className="mx-6 mt-4 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-xs leading-6 text-muted-foreground">
          {previewNotice}
        </div>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
