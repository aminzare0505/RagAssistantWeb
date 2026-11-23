import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-foreground',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted',
        info: 'border-info/40 bg-info/10',
        success: 'border-success/40 bg-success/10',
        warning: 'border-warning/50 bg-warning/10',
        destructive: 'border-destructive/40 bg-destructive/10',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />;
}

export { Badge };
