import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/app/providers/app-providers';
import { fa } from '@/i18n/fa';

import { getMockSchema } from '../mock/mock-schema';
import type { SchemaDatabase } from '../types';
import { SchemaBrowser } from './schema-browser';

function mockSchema(id: string): SchemaDatabase[] {
  const schema = getMockSchema(id);
  if (!schema) {
    throw new Error(`missing mock schema for ${id}`);
  }
  return schema;
}

function renderSchema(schema: SchemaDatabase[] | null) {
  return render(
    <AppProviders>
      <SchemaBrowser schema={schema} />
    </AppProviders>,
  );
}

function treeItems(): HTMLElement[] {
  return screen.getAllByRole('treeitem');
}

describe('schema browser', () => {
  it('renders databases, the first table, and its columns with type and nullability', () => {
    renderSchema(mockSchema('src-01'));

    expect(treeItems()).toHaveLength(9);
    expect(screen.getByText('SalesArchive')).toBeInTheDocument();
    expect(screen.getByText('CustomerId')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText(/nvarchar\(255\)/)).toBeInTheDocument();
    expect(screen.getAllByText(fa.dataSources.nullableYes).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fa.dataSources.nullableNo).length).toBeGreaterThan(0);
  });

  it('collapses and expands a database when its row is clicked', async () => {
    const user = userEvent.setup();
    renderSchema(mockSchema('src-01'));

    await user.click(screen.getByText('SalesDb'));
    expect(treeItems()).toHaveLength(2);

    await user.click(screen.getByText('SalesDb'));
    expect(treeItems()).toHaveLength(9);
  });

  it('moves between visible rows with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSchema(mockSchema('src-01'));

    treeItems()[0]!.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(treeItems()[1]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(treeItems()[2]);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(treeItems()[1]);
  });

  it('expands with ArrowRight and collapses with ArrowLeft', async () => {
    const user = userEvent.setup();
    renderSchema(mockSchema('src-01'));

    treeItems()[0]!.focus();
    await user.keyboard('{ArrowDown}');

    await user.keyboard('{ArrowLeft}');
    expect(treeItems()).toHaveLength(5);

    await user.keyboard('{ArrowRight}');
    expect(treeItems()).toHaveLength(9);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(treeItems()[2]);
  });

  it('jumps to the first and last rows with Home and End', async () => {
    const user = userEvent.setup();
    renderSchema(mockSchema('src-01'));

    treeItems()[1]!.focus();

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(treeItems()[treeItems().length - 1]);

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(treeItems()[0]);
  });

  it('toggles a database with Enter', async () => {
    const user = userEvent.setup();
    renderSchema(mockSchema('src-01'));

    treeItems()[0]!.focus();
    await user.keyboard('{Enter}');
    expect(treeItems()).toHaveLength(2);

    await user.keyboard('{Enter}');
    expect(treeItems()).toHaveLength(9);
  });

  it('shows the empty message when the source has no example schema', () => {
    renderSchema(null);

    expect(screen.getByText(fa.dataSources.schemaEmpty)).toBeInTheDocument();
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
  });
});
