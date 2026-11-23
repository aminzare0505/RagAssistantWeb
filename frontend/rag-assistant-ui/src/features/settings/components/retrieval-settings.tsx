import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/use-language';

import { useSettingsDrafts } from '../hooks/use-settings-drafts';
import { DEFAULT_RETRIEVAL_DRAFT } from '../lib/settings-defaults';
import {
  createRetrievalSchema,
  toRetrievalFormValues,
  type RetrievalFormValues,
} from '../lib/settings-schema';
import {
  resetSettingsSection,
  saveRetrievalDraft,
} from '../mock/settings-draft-store';
import { SettingsSection } from './settings-section';

export function RetrievalSettings() {
  const { t } = useLanguage();
  const drafts = useSettingsDrafts();
  const [status, setStatus] = useState('');
  const chunkId = useId();
  const overlapId = useId();
  const topKId = useId();
  const similarityId = useId();
  const similarityNoteId = useId();

  const schema = useMemo(() => createRetrievalSchema(t.settings.retrieval.validation), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RetrievalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toRetrievalFormValues(drafts.retrieval),
  });

  const onSubmit = handleSubmit((values) => {
    saveRetrievalDraft({
      chunkSize: Number(values.chunkSize),
      overlapTokens: Number(values.overlapTokens),
      topK: Number(values.topK),
    });
    setStatus(t.settings.retrieval.savedAnnouncement);
  });

  return (
    <SettingsSection
      title={t.settings.retrieval.title}
      description={t.settings.retrieval.previewNotice}
      previewBadge={t.settings.retrieval.previewBadge}
      previewNotice={t.settings.retrieval.unsupportedNote}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor={chunkId} className="text-sm font-medium">
              {t.settings.retrieval.chunkSizeLabel}
            </label>
            <Input
              id={chunkId}
              dir="ltr"
              inputMode="numeric"
              aria-invalid={errors.chunkSize ? true : undefined}
              aria-describedby={errors.chunkSize ? 'retrieval-chunk-error' : undefined}
              {...register('chunkSize')}
            />
            {errors.chunkSize?.message ? (
              <p id="retrieval-chunk-error" className="text-sm text-destructive">
                {errors.chunkSize.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={overlapId} className="text-sm font-medium">
              {t.settings.retrieval.overlapLabel}
            </label>
            <Input
              id={overlapId}
              dir="ltr"
              inputMode="numeric"
              aria-invalid={errors.overlapTokens ? true : undefined}
              aria-describedby={errors.overlapTokens ? 'retrieval-overlap-error' : undefined}
              {...register('overlapTokens')}
            />
            {errors.overlapTokens?.message ? (
              <p id="retrieval-overlap-error" className="text-sm text-destructive">
                {errors.overlapTokens.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={topKId} className="text-sm font-medium">
              {t.settings.retrieval.topKLabel}
            </label>
            <Input
              id={topKId}
              dir="ltr"
              inputMode="numeric"
              aria-invalid={errors.topK ? true : undefined}
              aria-describedby={errors.topK ? 'retrieval-topk-error' : undefined}
              {...register('topK')}
            />
            {errors.topK?.message ? (
              <p id="retrieval-topk-error" className="text-sm text-destructive">
                {errors.topK.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={similarityId} className="text-sm font-medium">
            {t.settings.retrieval.similarityLabel}
          </label>
          <Input
            id={similarityId}
            dir="ltr"
            disabled
            defaultValue=""
            placeholder={t.settings.retrieval.similarityUnsupported}
            aria-describedby={similarityNoteId}
          />
          <p id={similarityNoteId} className="text-xs leading-6 text-muted-foreground">
            {t.settings.retrieval.unsupportedNote}
          </p>
        </div>

        {Object.keys(errors).length > 0 ? (
          <p role="alert" className="text-sm text-destructive">
            {t.dataSources.validation.fixHint}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{t.settings.retrieval.save}</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetSettingsSection('retrieval');
              reset(toRetrievalFormValues(DEFAULT_RETRIEVAL_DRAFT));
              setStatus(t.settings.retrieval.resetAnnouncement);
            }}
          >
            {t.settings.retrieval.reset}
          </Button>
        </div>

        <p role="status" className="text-xs leading-6 text-muted-foreground">
          {status}
        </p>
      </form>
    </SettingsSection>
  );
}
