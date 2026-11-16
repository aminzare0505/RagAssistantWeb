import { Database } from 'lucide-react';

import { FeaturePlaceholder } from '@/components/shared/feature-placeholder';
import { fa } from '@/i18n/fa';

export function DataSourcesPage() {
  return (
    <FeaturePlaceholder
      title={fa.nav.dataSources}
      description={fa.features.dataSources.description}
      icon={Database}
    />
  );
}
