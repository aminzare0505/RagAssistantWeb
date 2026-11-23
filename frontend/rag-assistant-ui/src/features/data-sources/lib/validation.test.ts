import { describe, expect, it } from 'vitest';

import { fa } from '@/i18n/fa';

import type { DataSourceFormValues } from './validation';
import { createDataSourceSchema, toConnection } from './validation';

const messages = fa.dataSources.validation;

const validCreate: DataSourceFormValues = {
  name: 'Sales reporting',
  type: 'sql-server',
  host: 'db.internal',
  port: '1433',
  database: 'SalesDb',
  username: 'report_reader',
  password: 'preview-secret',
};

type Options = Parameters<typeof createDataSourceSchema>[1];

function parse(values: DataSourceFormValues, options?: Partial<Options>) {
  return createDataSourceSchema(messages, {
    mode: 'create',
    isNameTaken: () => false,
    ...options,
  }).safeParse(values);
}

function messageFor(
  values: DataSourceFormValues,
  field: keyof DataSourceFormValues,
  options?: Partial<Options>,
): string | undefined {
  const result = parse(values, options);
  if (result.success) {
    return undefined;
  }
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('data source schema', () => {
  it('accepts a complete SQL Server connection', () => {
    expect(parse(validCreate).success).toBe(true);
  });

  it('trims the text fields before storing them', () => {
    const data = createDataSourceSchema(messages, {
      mode: 'create',
      isNameTaken: () => false,
    }).parse({
      ...validCreate,
      name: '  Sales reporting  ',
      host: ' db.internal ',
      database: ' SalesDb ',
      username: ' report_reader ',
    });

    expect(data).toMatchObject({
      name: 'Sales reporting',
      host: 'db.internal',
      database: 'SalesDb',
      username: 'report_reader',
    });
  });

  it('rejects a one-character display name', () => {
    expect(messageFor({ ...validCreate, name: 'S' }, 'name')).toBe(messages.nameLength);
  });

  it('rejects a host containing whitespace or path characters', () => {
    expect(messageFor({ ...validCreate, host: 'db internal' }, 'host')).toBe(
      messages.hostInvalid,
    );
    expect(messageFor({ ...validCreate, host: 'db/internal' }, 'host')).toBe(
      messages.hostInvalid,
    );
  });

  it('accepts ports 1 and 65535 and rejects out-of-range or fractional values', () => {
    expect(parse({ ...validCreate, port: '1' }).success).toBe(true);
    expect(parse({ ...validCreate, port: '65535' }).success).toBe(true);

    for (const port of ['0', '65536', '1433.5', 'abc']) {
      expect(messageFor({ ...validCreate, port }, 'port')).toBe(messages.portInvalid);
    }
  });

  it('requires a database name', () => {
    expect(messageFor({ ...validCreate, database: ' ' }, 'database')).toBe(
      messages.databaseRequired,
    );
  });

  it('requires a username', () => {
    expect(messageFor({ ...validCreate, username: '' }, 'username')).toBe(
      messages.usernameRequired,
    );
  });

  it('requires a password when creating a source', () => {
    expect(messageFor({ ...validCreate, password: '' }, 'password')).toBe(
      messages.passwordRequired,
    );
  });

  it('accepts a blank password when editing, meaning the credential is kept', () => {
    const result = parse({ ...validCreate, password: '' }, { mode: 'edit' });
    expect(result.success).toBe(true);
  });

  it('reports a duplicate name through the provided check', () => {
    expect(
      messageFor({ ...validCreate, name: 'Analytics warehouse' }, 'name', {
        isNameTaken: (name) => name === 'Analytics warehouse',
      }),
    ).toBe(messages.nameDuplicate);
  });

  it('drops the password when mapping to the stored connection', () => {
    const connection = toConnection(validCreate);

    expect(connection).toEqual({
      host: 'db.internal',
      port: 1433,
      database: 'SalesDb',
      username: 'report_reader',
    });
    expect(Object.keys(connection)).not.toContain('password');
  });
});
