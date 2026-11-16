import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/i18n/use-language';

import { LoginShell } from '../components/login-shell';
import { createLoginSchema, type LoginInput } from '../login-schema';
import { loginErrorMessage } from '../login-error-message';
import { safeReturnTo } from '../safe-return-to';
import { useAuth } from '../use-auth';

export function LoginPage() {
  const { t } = useLanguage();
  const { status, sessionEndedReason, login } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const usernameId = useId();
  const passwordId = useId();
  const usernameErrorId = `${usernameId}-error`;
  const passwordErrorId = `${passwordId}-error`;

  const schema = useMemo(() => createLoginSchema(t.auth.errors), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    document.title = `${t.auth.signInTitle} — ${t.appName}`;
  }, [t]);

  if (status === 'authenticated') {
    return <Navigate to={returnTo ?? '/'} replace />;
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    void login(values).catch((error) => {
      setFormError(loginErrorMessage(error, t.auth.errors));
    });
  });

  return (
    <LoginShell>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signInTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.auth.signInDescription}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {sessionEndedReason === 'expired' ? (
            <div role="status" className="rounded-md border bg-muted px-3 py-2 text-sm">
              <p className="font-medium">{t.auth.sessionExpiredTitle}</p>
              <p className="text-muted-foreground">{t.auth.sessionExpiredDescription}</p>
            </div>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
            noValidate
            aria-busy={isSubmitting}
          >
            <div className="space-y-1.5">
              <label htmlFor={usernameId} className="text-sm font-medium">
                {t.auth.usernameLabel}
              </label>
              <Input
                id={usernameId}
                type="text"
                autoComplete="username"
                placeholder={t.auth.usernamePlaceholder}
                className="h-11"
                disabled={isSubmitting}
                aria-invalid={errors.username ? true : undefined}
                aria-describedby={errors.username ? usernameErrorId : undefined}
                {...register('username')}
              />
              {errors.username?.message ? (
                <p id={usernameErrorId} className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="text-sm font-medium">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Input
                  id={passwordId}
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t.auth.passwordPlaceholder}
                  className="h-11 pe-12"
                  disabled={isSubmitting}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? passwordErrorId : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute end-0 top-0 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={
                    isPasswordVisible ? t.auth.hidePassword : t.auth.showPassword
                  }
                  aria-pressed={isPasswordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  disabled={isSubmitting}
                >
                  {isPasswordVisible ? (
                    <EyeOff aria-hidden className="size-5" />
                  ) : (
                    <Eye aria-hidden className="size-5" />
                  )}
                </button>
              </div>
              {errors.password?.message ? (
                <p id={passwordErrorId} className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" label={t.auth.submitting} />
                  <span aria-hidden>{t.auth.submitting}</span>
                </span>
              ) : (
                t.auth.submit
              )}
            </Button>
          </form>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t.appTagline}</p>
    </LoginShell>
  );
}
