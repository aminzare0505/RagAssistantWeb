import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useLanguage } from '@/i18n/use-language';

import { useSettingsDrafts } from '../hooks/use-settings-drafts';
import { DEFAULT_AI_DRAFT, SETTINGS_PROVIDER } from '../lib/settings-defaults';
import {
  createAiSchema,
  toAiFormValues,
  type AiFormValues,
} from '../lib/settings-schema';
import { resetSettingsSection, saveAiDraft } from '../mock/settings-draft-store';
import { SettingsSection } from './settings-section';

export function AiSettings() {
  const { t } = useLanguage();
  const drafts = useSettingsDrafts();
  const [status, setStatus] = useState('');
  const providerId = useId();
  const modelId = useId();
  const timeoutId = useId();

  const schema = useMemo(() => createAiSchema(t.settings.ai.validation), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AiFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toAiFormValues(drafts.ai),
  });

  const onSubmit = handleSubmit((values) => {
    saveAiDraft({ model: values.model, timeoutSeconds: Number(values.timeoutSeconds) });
    setStatus(t.settings.ai.savedAnnouncement);
  });

  return (
    <SettingsSection
      title={t.settings.ai.title}
      description={t.settings.ai.providerNote}
      previewBadge={t.settings.ai.previewBadge}
      previewNotice={t.settings.ai.previewNotice}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={providerId} className="text-sm font-medium">
              {t.settings.ai.providerLabel}
            </label>
            <Select
              id={providerId}
              value={SETTINGS_PROVIDER}
              disabled
              onChange={() => undefined}
            >
              <option value={SETTINGS_PROVIDER}>{t.settings.ai.providerOllama}</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={modelId} className="text-sm font-medium">
              {t.settings.ai.modelLabel}
            </label>
            <Input
              id={modelId}
              dir="ltr"
              placeholder={t.settings.ai.modelPlaceholder}
              aria-invalid={errors.model ? true : undefined}
              aria-describedby={errors.model ? 'ai-model-error' : undefined}
              {...register('model')}
            />
            {errors.model?.message ? (
              <p id="ai-model-error" className="text-sm text-destructive">
                {errors.model.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={timeoutId} className="text-sm font-medium">
              {t.settings.ai.timeoutLabel}
            </label>
            <Input
              id={timeoutId}
              dir="ltr"
              inputMode="numeric"
              aria-invalid={errors.timeoutSeconds ? true : undefined}
              aria-describedby={errors.timeoutSeconds ? 'ai-timeout-error' : undefined}
              {...register('timeoutSeconds')}
            />
            {errors.timeoutSeconds?.message ? (
              <p id="ai-timeout-error" className="text-sm text-destructive">
                {errors.timeoutSeconds.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{t.settings.ai.save}</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetSettingsSection('ai');
              reset(toAiFormValues(DEFAULT_AI_DRAFT));
              setStatus(t.settings.ai.resetAnnouncement);
            }}
          >
            {t.settings.ai.reset}
          </Button>
        </div>

        <p role="status" className="text-xs leading-6 text-muted-foreground">
          {status}
        </p>
      </form>
    </SettingsSection>
  );
}
