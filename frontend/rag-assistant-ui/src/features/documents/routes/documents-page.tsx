import { FileText } from 'lucide-react';

import { FeaturePlaceholder } from '@/components/shared/feature-placeholder';
import { fa } from '@/i18n/fa';

export function DocumentsPage() {
  return (
    <FeaturePlaceholder
      title={fa.nav.documents}
      description={fa.features.documents.description}
      icon={FileText}
    />
  );
}
