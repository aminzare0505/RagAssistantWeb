import { MessageSquare } from 'lucide-react';

import { FeaturePlaceholder } from '@/components/shared/feature-placeholder';
import { fa } from '@/i18n/fa';

export function ChatPage() {
  return (
    <FeaturePlaceholder
      title={fa.nav.chat}
      description={fa.features.chat.description}
      icon={MessageSquare}
    />
  );
}
