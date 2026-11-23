import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { useLanguage } from '@/i18n/use-language';

import type { DataSourceFormValues } from '../lib/validation';

interface ConnectionFieldsProps {
  mode: 'create' | 'edit';
  register: UseFormRegister<DataSourceFormValues>;
  errors: FieldErrors<DataSourceFormValues>;
  disabled?: boolean;
}

export function ConnectionFields({ mode, register, errors, disabled }: ConnectionFieldsProps) {
  const { t } = useLanguage();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const hostId = useId();
  const portId = useId();
  const databaseId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const passwordHintId = useId();

  const fieldError = (field: keyof DataSourceFormValues) => {
    const message = errors[field]?.message;
    return message ? (
      <p id={`${field}-error`} className="text-sm text-destructive">
        {message}
      </p>
    ) : null;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor={hostId} className="text-sm font-medium">
          {t.dataSources.fields.host}
        </label>
        <Input
          id={hostId}
          dir="ltr"
          autoComplete="off"
          placeholder={t.dataSources.fields.hostPlaceholder}
          disabled={disabled}
          aria-invalid={errors.host ? true : undefined}
          aria-describedby={errors.host ? 'host-error' : undefined}
          {...register('host')}
        />
        {fieldError('host')}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={portId} className="text-sm font-medium">
          {t.dataSources.fields.port}
        </label>
        <Input
          id={portId}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={errors.port ? true : undefined}
          aria-describedby={errors.port ? 'port-error' : undefined}
          {...register('port')}
        />
        {fieldError('port')}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={databaseId} className="text-sm font-medium">
          {t.dataSources.fields.database}
        </label>
        <Input
          id={databaseId}
          dir="ltr"
          autoComplete="off"
          placeholder={t.dataSources.fields.databasePlaceholder}
          disabled={disabled}
          aria-invalid={errors.database ? true : undefined}
          aria-describedby={errors.database ? 'database-error' : undefined}
          {...register('database')}
        />
        {fieldError('database')}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={usernameId} className="text-sm font-medium">
          {t.dataSources.fields.username}
        </label>
        <Input
          id={usernameId}
          dir="ltr"
          autoComplete="off"
          placeholder={t.dataSources.fields.usernamePlaceholder}
          disabled={disabled}
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? 'username-error' : undefined}
          {...register('username')}
        />
        {fieldError('username')}
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={passwordId} className="text-sm font-medium">
          {t.dataSources.fields.password}
        </label>
        <div className="relative">
          <Input
            id={passwordId}
            dir="ltr"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={
              mode === 'create'
                ? t.dataSources.fields.passwordPlaceholderCreate
                : t.dataSources.fields.passwordPlaceholderEdit
            }
            className="pe-11"
            disabled={disabled}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? `password-error ${passwordHintId}` : passwordHintId
            }
            {...register('password')}
          />
          <button
            type="button"
            className="absolute end-0 top-0 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label={
              isPasswordVisible
                ? t.dataSources.fields.hidePassword
                : t.dataSources.fields.showPassword
            }
            aria-pressed={isPasswordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
            disabled={disabled}
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </button>
        </div>
        {fieldError('password')}
        <p id={passwordHintId} className="text-xs leading-6 text-muted-foreground">
          {t.dataSources.fields.passwordHint}
        </p>
      </div>
    </div>
  );
}
