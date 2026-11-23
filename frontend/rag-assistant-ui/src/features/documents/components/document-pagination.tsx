import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';

import { formatNumber } from '../lib/format';

interface DocumentPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DocumentPagination({ page, totalPages, onPageChange }: DocumentPaginationProps) {
  const { t, language } = useLanguage();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t.documents.paginationLabel}
      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden className="rtl:rotate-180" />
        {t.documents.previousPage}
      </Button>
      <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {t.documents.pageIndicator(
          formatNumber(page, language),
          formatNumber(totalPages, language),
        )}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t.documents.nextPage}
        <ChevronRight aria-hidden className="rtl:rotate-180" />
      </Button>
    </nav>
  );
}
