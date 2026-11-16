import { Settings } from 'lucide-react';

import { FeaturePlaceholder } from '@/components/shared/feature-placeholder';
import { fa } from '@/i18n/fa';

export function SettingsPage() {
  return (
    <FeaturePlaceholder
      title={fa.nav.settings}
      description={fa.features.settings.description}
      icon={Settings}
    />
  );
}
