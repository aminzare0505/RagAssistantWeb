import { useLanguage } from '@/i18n/use-language';

import type { DataSourceRecord } from '../types';
import { DataSourceRow } from './data-source-row';

interface DataSourceListProps {
  dataSources: DataSourceRecord[];
  onRequestDelete: (source: DataSourceRecord) => void;
}

export function DataSourceList({ dataSources, onRequestDelete }: DataSourceListProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="hidden border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] md:gap-4">
        <span>{t.dataSources.columns.name}</span>
        <span>{t.dataSources.columns.type}</span>
        <span>{t.dataSources.columns.status}</span>
        <span>{t.dataSources.columns.lastSync}</span>
        <span className="text-end">{t.dataSources.columns.actions}</span>
      </div>
      <ul aria-label={t.dataSources.listTitle}>
        {dataSources.map((source) => (
          <DataSourceRow key={source.id} source={source} onRequestDelete={onRequestDelete} />
        ))}
      </ul>
    </div>
  );
}
