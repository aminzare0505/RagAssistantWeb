import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import { copyText } from '../lib/clipboard';

type CopyStatus = 'idle' | 'copied' | 'failed';

interface CopyButtonProps {
  getText: () => string;
  label: string;
  className?: string;
  iconOnly?: boolean;
}

export function CopyButton({ getText, label, className, iconOnly = false }: CopyButtonProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<CopyStatus>('idle');

  const copy = () => {
    void copyText(getText()).then((succeeded) => {
      setStatus(succeeded ? 'copied' : 'failed');
    });
  };

  const feedback =
    status === 'copied' ? t.chat.copied : status === 'failed' ? t.chat.copyFailed : null;
  const visibleLabel = feedback ?? label;
  const Icon = status === 'copied' ? Check : status === 'failed' ? TriangleAlert : Copy;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={copy}
      aria-label={visibleLabel}
      className={cn('text-muted-foreground', className)}
    >
      <Icon aria-hidden />
      {iconOnly ? null : (
        <span aria-live="polite" className="text-xs">
          {visibleLabel}
        </span>
      )}
    </Button>
  );
}
