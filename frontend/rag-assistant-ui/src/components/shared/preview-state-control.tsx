import { Button } from '@/components/ui/button';

export type PreviewState = 'ready' | 'loading' | 'error';

export interface PreviewStateLabels {
  label: string;
  ready: string;
  loading: string;
  error: string;
  reset: string;
}

interface PreviewStateControlProps {
  state: PreviewState;
  onChange: (state: PreviewState) => void;
  labels: PreviewStateLabels;
  onReset: () => void;
}

/**
 * Development-only switch that makes the loading and error branches reachable
 * without faking a request. `import.meta.env.DEV` is false in production
 * builds, so Vite removes this UI from the shipped bundle.
 */
export function PreviewStateControl({
  state,
  onChange,
  labels,
  onReset,
}: PreviewStateControlProps) {
  if (!import.meta.env.DEV) {
    return null;
  }

  const options: Array<{ value: PreviewState; label: string }> = [
    { value: 'ready', label: labels.ready },
    { value: 'loading', label: labels.loading },
    { value: 'error', label: labels.error },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs">
      <span className="font-medium text-muted-foreground">{labels.label}</span>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={state === option.value ? 'secondary' : 'ghost'}
          aria-pressed={state === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={onReset}>
        {labels.reset}
      </Button>
    </div>
  );
}
