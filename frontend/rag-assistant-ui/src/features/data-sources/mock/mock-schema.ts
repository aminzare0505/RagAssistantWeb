import type { SchemaDatabase } from '../types';

/**
 * Example schema trees for the preview browser. This is fictional data, not a
 * reflection of any real database, and is shown only under the preview notice.
 * `src-05` intentionally returns `null` to exercise the empty state.
 * Delete this file when a verified schema endpoint exists.
 */
const SCHEMAS: Record<string, SchemaDatabase[]> = {
  'src-01': [
    {
      name: 'SalesDb',
      tables: [
        {
          name: 'Customers',
          columns: [
            { name: 'CustomerId', dataType: 'int', nullable: false },
            { name: 'FullName', dataType: 'nvarchar(120)', nullable: false },
            { name: 'Email', dataType: 'nvarchar(255)', nullable: true },
            { name: 'CreatedAt', dataType: 'datetime2', nullable: false },
          ],
        },
        {
          name: 'Orders',
          columns: [
            { name: 'OrderId', dataType: 'int', nullable: false },
            { name: 'CustomerId', dataType: 'int', nullable: false },
            { name: 'OrderDate', dataType: 'datetime2', nullable: false },
            { name: 'TotalAmount', dataType: 'decimal(18,2)', nullable: false },
            { name: 'IsCancelled', dataType: 'bit', nullable: false },
          ],
        },
        {
          name: 'OrderLines',
          columns: [
            { name: 'OrderLineId', dataType: 'int', nullable: false },
            { name: 'OrderId', dataType: 'int', nullable: false },
            { name: 'ProductName', dataType: 'nvarchar(160)', nullable: false },
            { name: 'Quantity', dataType: 'int', nullable: false },
            { name: 'UnitPrice', dataType: 'decimal(18,2)', nullable: false },
          ],
        },
      ],
    },
    {
      name: 'SalesArchive',
      tables: [
        {
          name: 'InvoiceHeaders',
          columns: [
            { name: 'InvoiceId', dataType: 'int', nullable: false },
            { name: 'IssuedOn', dataType: 'date', nullable: false },
            { name: 'Status', dataType: 'nvarchar(24)', nullable: false },
          ],
        },
      ],
    },
  ],
  'src-02': [
    {
      name: 'Analytics',
      tables: [
        {
          name: 'FactSales',
          columns: [
            { name: 'SaleKey', dataType: 'bigint', nullable: false },
            { name: 'DateKey', dataType: 'int', nullable: false },
            { name: 'CustomerKey', dataType: 'int', nullable: false },
            { name: 'Revenue', dataType: 'decimal(18,2)', nullable: false },
          ],
        },
        {
          name: 'DimCustomer',
          columns: [
            { name: 'CustomerKey', dataType: 'int', nullable: false },
            { name: 'Segment', dataType: 'nvarchar(40)', nullable: true },
            { name: 'Region', dataType: 'nvarchar(40)', nullable: true },
          ],
        },
        {
          name: 'DimProduct',
          columns: [
            { name: 'ProductKey', dataType: 'int', nullable: false },
            { name: 'Category', dataType: 'nvarchar(60)', nullable: true },
            { name: 'ListPrice', dataType: 'decimal(18,2)', nullable: false },
          ],
        },
      ],
    },
  ],
  'src-03': [
    {
      name: 'Crm',
      tables: [
        {
          name: 'Contacts',
          columns: [
            { name: 'ContactId', dataType: 'int', nullable: false },
            { name: 'CompanyName', dataType: 'nvarchar(160)', nullable: false },
            { name: 'Phone', dataType: 'nvarchar(32)', nullable: true },
          ],
        },
        {
          name: 'Deals',
          columns: [
            { name: 'DealId', dataType: 'int', nullable: false },
            { name: 'ContactId', dataType: 'int', nullable: false },
            { name: 'Stage', dataType: 'nvarchar(32)', nullable: false },
            { name: 'Value', dataType: 'decimal(18,2)', nullable: true },
          ],
        },
      ],
    },
  ],
  'src-04': [
    {
      name: 'LegacyArchive',
      tables: [
        {
          name: 'ArchiveDocs',
          columns: [
            { name: 'DocumentId', dataType: 'uniqueidentifier', nullable: false },
            { name: 'Title', dataType: 'nvarchar(255)', nullable: false },
            { name: 'ArchivedAt', dataType: 'datetime2', nullable: true },
          ],
        },
      ],
    },
  ],
};

export function getMockSchema(sourceId: string): SchemaDatabase[] | null {
  return SCHEMAS[sourceId] ?? null;
}
