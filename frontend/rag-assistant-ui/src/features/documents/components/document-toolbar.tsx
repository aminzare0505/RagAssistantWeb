import { Search } from 'lucide-react';
import { useId } from 'react';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useLanguage } from '@/i18n/use-language';

import { formatNumber } from '../lib/format';
import {
  DOCUMENT_PAGE_SIZES,
  DOCUMENT_STATUSES,
  DOCUMENT_SORTS,
  isDocumentFileType,
  isDocumentSort,
  isDocumentStatus,
  type DocumentQuery,
  type DocumentSort,
} from '../lib/query';

interface DocumentToolbarProps {
  query: DocumentQuery;
  total: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DocumentQuery['status']) => void;
  onTypeChange: (value: DocumentQuery['type']) => void;
  onSortChange: (value: DocumentSort) => void;
  onPageSizeChange: (value: number) => void;
}

export function DocumentToolbar({
  query,
  total,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
  onPageSizeChange,
}: DocumentToolbarProps) {
  const { t, language } = useLanguage();
  const searchId = useId();
  const statusId = useId();
  const typeId = useId();
  const sortId = useId();
  const pageSizeId = useId();

  const sortLabels: Record<DocumentSort, string> = {
    'name-asc': t.documents.sortNameAsc,
    'name-desc': t.documents.sortNameDesc,
    'date-asc': t.documents.sortDateAsc,
    'date-desc': t.documents.sortDateDesc,
    'size-asc': t.documents.sortSizeAsc,
    'size-desc': t.documents.sortSizeDesc,
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t.documents.searchLabel}
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={searchId}
          type="search"
          value={query.q}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t.documents.searchPlaceholder}
          className="ps-8"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor={statusId} className="text-xs font-medium text-muted-foreground">
            {t.documents.statusFilterLabel}
          </label>
          <Select
            id={statusId}
            value={query.status}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all' || isDocumentStatus(value)) {
                onStatusChange(value);
              }
            }}
          >
            <option value="all">{t.documents.statusFilterAll}</option>
            {DOCUMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.documents.status[status]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label htmlFor={typeId} className="text-xs font-medium text-muted-foreground">
            {t.documents.typeFilterLabel}
          </label>
          <Select
            id={typeId}
            value={query.type}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all' || isDocumentFileType(value)) {
                onTypeChange(value);
              }
            }}
          >
            <option value="all">{t.documents.typeFilterAll}</option>
            <option value="pdf">{t.documents.typeFilterPdf}</option>
          </Select>
          <p className="text-[11px] leading-5 text-muted-foreground">
            {t.documents.typeFilterHint}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor={sortId} className="text-xs font-medium text-muted-foreground">
            {t.documents.sortLabel}
          </label>
          <Select
            id={sortId}
            value={query.sort}
            onChange={(event) => {
              if (isDocumentSort(event.target.value)) {
                onSortChange(event.target.value);
              }
            }}
          >
            {DOCUMENT_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {sortLabels[sort]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label htmlFor={pageSizeId} className="text-xs font-medium text-muted-foreground">
            {t.documents.pageSizeLabel}
          </label>
          <Select
            id={pageSizeId}
            value={String(query.size)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {DOCUMENT_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {formatNumber(size, language)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t.documents.resultCount(formatNumber(total, language))}
      </p>
    </div>
  );
}
