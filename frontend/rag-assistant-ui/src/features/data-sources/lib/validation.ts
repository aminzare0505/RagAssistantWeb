import { z } from 'zod';

import type { DataSourceConnection } from '../types';

/**
 * Preview-only client validation. The server would be authoritative; these
 * rules exist to exercise the form UX and are not backend policy.
 */
export const SQL_SERVER_DEFAULT_PORT = 1433;

export interface DataSourceValidationMessages {
  nameRequired: string;
  nameLength: string;
  nameDuplicate: string;
  hostRequired: string;
  hostInvalid: string;
  portInvalid: string;
  databaseRequired: string;
  databaseLength: string;
  usernameRequired: string;
  passwordRequired: string;
  passwordLength: string;
}

interface DataSourceSchemaOptions {
  mode: 'create' | 'edit';
  isNameTaken: (name: string) => boolean;
}

function isValidHost(value: string): boolean {
  return /^[A-Za-z0-9.:_-]+$/.test(value);
}

function isValidPort(value: string): boolean {
  if (!/^\d+$/.test(value)) {
    return false;
  }
  const port = Number(value);
  return port >= 1 && port <= 65535;
}

export function createDataSourceSchema(
  messages: DataSourceValidationMessages,
  options: DataSourceSchemaOptions,
) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.nameRequired)
      .min(2, messages.nameLength)
      .max(80, messages.nameLength)
      .refine((name) => !options.isNameTaken(name), messages.nameDuplicate),
    type: z.literal('sql-server'),
    host: z
      .string()
      .trim()
      .min(1, messages.hostRequired)
      .max(255, messages.hostInvalid)
      .refine(isValidHost, messages.hostInvalid),
    port: z.string().trim().refine(isValidPort, messages.portInvalid),
    database: z
      .string()
      .trim()
      .min(1, messages.databaseRequired)
      .max(128, messages.databaseLength),
    username: z.string().trim().min(1, messages.usernameRequired).max(128, messages.usernameRequired),
    password:
      options.mode === 'create'
        ? z.string().min(1, messages.passwordRequired).max(256, messages.passwordLength)
        : z.string().max(256, messages.passwordLength),
  });
}

export type DataSourceFormValues = z.infer<ReturnType<typeof createDataSourceSchema>>;

/** Maps validated values to the stored shape; the password is dropped here. */
export function toConnection(values: DataSourceFormValues): DataSourceConnection {
  return {
    host: values.host,
    port: Number(values.port),
    database: values.database,
    username: values.username,
  };
}
