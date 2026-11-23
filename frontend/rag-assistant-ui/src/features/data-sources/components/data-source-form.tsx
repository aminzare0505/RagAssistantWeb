import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useLanguage } from '@/i18n/use-language';

import { useDataSources } from '../hooks/use-data-sources';
import {
  createDataSourceSchema,
  toConnection,
  type DataSourceFormValues,
} from '../lib/validation';
import { addDataSource, updateDataSource } from '../mock/data-source-preview-store';
import type { DataSourceRecord } from '../types';
import { ConnectionFields } from './connection-fields';

interface DataSourceFormProps {
  mode: 'create' | 'edit';
  source: DataSourceRecord | null;
}

export function DataSourceForm({ mode, source }: DataSourceFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { dataSources } = useDataSources();
  const nameId = useId();
  const typeId = useId();
  const typeHintId = useId();

  const schema = useMemo(
    () =>
      createDataSourceSchema(t.dataSources.validation, {
        mode,
        isNameTaken: (name) =>
          dataSources.some(
            (candidate) =>
              candidate.id !== source?.id &&
              candidate.name.trim().toLowerCase() === name.trim().toLowerCase(),
          ),
      }),
    [t, mode, dataSources, source?.id],
  );

  const defaultValues = useMemo<DataSourceFormValues>(
    () =>
      source
        ? {
            name: source.name,
            type: source.type,
            host: source.connection.host,
            port: String(source.connection.port),
            database: source.connection.database,
            username: source.connection.username,
            password: '',
          }
        : {
            name: '',
            type: 'sql-server',
            host: '',
            port: '1433',
            database: '',
            username: '',
            password: '',
          },
    [source],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DataSourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    const connection = toConnection(values);
    const hasCredential =
      values.password.length > 0 || (source ? source.hasCredential : false);

    if (mode === 'create') {
      const created = addDataSource({
        name: values.name,
        type: values.type,
        connection,
        hasCredential,
      });
      void navigate(`/data-sources/${created.id}`, {
        state: { announcement: t.dataSources.addedAnnouncement(created.name) },
      });
      return;
    }

    if (source) {
      updateDataSource(source.id, { name: values.name, connection, hasCredential });
      void navigate(`/data-sources/${source.id}`, {
        state: { announcement: t.dataSources.updatedAnnouncement(values.name) },
      });
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="space-y-1.5">
        <label htmlFor={nameId} className="text-sm font-medium">
          {t.dataSources.fields.name}
        </label>
        <Input
          id={nameId}
          autoComplete="off"
          placeholder={t.dataSources.fields.namePlaceholder}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name?.message ? (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={typeId} className="text-sm font-medium">
          {t.dataSources.fields.type}
        </label>
        <Select
          id={typeId}
          value="sql-server"
          disabled
          aria-describedby={typeHintId}
          onChange={() => undefined}
        >
          <option value="sql-server">{t.dataSources.fields.typeSqlServer}</option>
        </Select>
        <p id={typeHintId} className="text-xs leading-6 text-muted-foreground">
          {t.dataSources.fields.typeOnlyOptionNote}
        </p>
      </div>

      <ConnectionFields mode={mode} register={register} errors={errors} />

      {Object.keys(errors).length > 0 ? (
        <p role="alert" className="text-sm text-destructive">
          {t.dataSources.validation.fixHint}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {t.dataSources.save}
        </Button>
        <Button asChild variant="outline">
          <Link to={mode === 'edit' && source ? `/data-sources/${source.id}` : '/data-sources'}>
            {t.dataSources.cancel}
          </Link>
        </Button>
      </div>
    </form>
  );
}
