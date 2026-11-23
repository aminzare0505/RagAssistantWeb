import { ChevronDown, ChevronRight, Database, Table2 } from 'lucide-react';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { useLanguage } from '@/i18n/use-language';
import { cn } from '@/lib/utils';

import type { SchemaColumn, SchemaDatabase } from '../types';

interface FlatNode {
  key: string;
  level: 1 | 2 | 3;
  kind: 'database' | 'table' | 'column';
  label: string;
  parentKey?: string;
  expandable: boolean;
  expanded: boolean;
  column?: SchemaColumn;
}

function buildNodes(schema: SchemaDatabase[], expanded: Set<string>): FlatNode[] {
  const nodes: FlatNode[] = [];

  for (const database of schema) {
    const databaseKey = `db:${database.name}`;
    const databaseOpen = expanded.has(databaseKey);
    nodes.push({
      key: databaseKey,
      level: 1,
      kind: 'database',
      label: database.name,
      expandable: database.tables.length > 0,
      expanded: databaseOpen,
    });

    if (!databaseOpen) {
      continue;
    }

    for (const table of database.tables) {
      const tableKey = `${databaseKey}/table:${table.name}`;
      const tableOpen = expanded.has(tableKey);
      nodes.push({
        key: tableKey,
        level: 2,
        kind: 'table',
        label: table.name,
        parentKey: databaseKey,
        expandable: table.columns.length > 0,
        expanded: tableOpen,
      });

      if (!tableOpen) {
        continue;
      }

      for (const column of table.columns) {
        nodes.push({
          key: `${tableKey}/column:${column.name}`,
          level: 3,
          kind: 'column',
          label: column.name,
          parentKey: tableKey,
          expandable: false,
          expanded: false,
          column,
        });
      }
    }
  }

  return nodes;
}

interface SchemaBrowserProps {
  schema: SchemaDatabase[] | null;
}

export function SchemaBrowser({ schema }: SchemaBrowserProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = schema?.[0];
    if (!first) {
      return new Set<string>();
    }
    const initial = new Set<string>([`db:${first.name}`]);
    if (first.tables[0]) {
      initial.add(`db:${first.name}/table:${first.tables[0].name}`);
    }
    return initial;
  });
  const [activeKey, setActiveKey] = useState('');
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const nodes = useMemo(() => (schema ? buildNodes(schema, expanded) : []), [schema, expanded]);
  const activeIndex = Math.max(
    0,
    nodes.findIndex((node) => node.key === activeKey),
  );
  const tabbableKey = nodes[activeIndex]?.key ?? '';

  if (!schema || schema.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t.dataSources.schemaEmpty}
      </div>
    );
  }

  const toggle = (key: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const focusNode = (key: string) => {
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const current = nodes[activeIndex];
    if (!current) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        const next = nodes[activeIndex + 1];
        if (next) {
          event.preventDefault();
          focusNode(next.key);
        }
        break;
      }
      case 'ArrowUp': {
        const previous = nodes[activeIndex - 1];
        if (previous) {
          event.preventDefault();
          focusNode(previous.key);
        }
        break;
      }
      case 'Home': {
        const first = nodes[0];
        if (first) {
          event.preventDefault();
          focusNode(first.key);
        }
        break;
      }
      case 'End': {
        const last = nodes[nodes.length - 1];
        if (last) {
          event.preventDefault();
          focusNode(last.key);
        }
        break;
      }
      case 'ArrowRight': {
        if (!current.expandable) {
          break;
        }
        event.preventDefault();
        if (!current.expanded) {
          toggle(current.key);
        } else {
          const child = nodes[activeIndex + 1];
          if (child?.parentKey === current.key) {
            focusNode(child.key);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (current.expandable && current.expanded) {
          toggle(current.key);
        } else if (current.parentKey) {
          focusNode(current.parentKey);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        if (current.expandable) {
          event.preventDefault();
          toggle(current.key);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <ul
      role="tree"
      aria-label={t.dataSources.schemaLabel}
      className="rounded-lg border p-1.5"
    >
      {nodes.map((node) => {
        const Icon =
          node.kind === 'database'
            ? Database
            : node.kind === 'table'
              ? Table2
              : null;
        const toggleIcon =
          node.expandable && node.expanded ? (
            <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          ) : node.expandable ? (
            <ChevronRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" />
          ) : (
            <span aria-hidden className="size-3.5 shrink-0" />
          );

        return (
          <li
            key={node.key}
            role="treeitem"
            aria-level={node.level}
            aria-selected={node.key === activeKey}
            aria-expanded={node.expandable ? node.expanded : undefined}
            tabIndex={node.key === tabbableKey ? 0 : -1}
            ref={(element) => {
              if (element) {
                itemRefs.current.set(node.key, element);
              } else {
                itemRefs.current.delete(node.key);
              }
            }}
            onClick={() => {
              setActiveKey(node.key);
              if (node.expandable) {
                toggle(node.key);
              }
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md py-2 pe-2 text-sm outline-none',
              'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50',
              node.level === 1 && 'ps-2 font-medium',
              node.level === 2 && 'ps-7',
              node.level === 3 && 'cursor-default ps-12',
            )}
          >
            {toggleIcon}
            {Icon ? <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" /> : null}
            {node.column ? (
              <>
                <span dir="ltr" className="min-w-0 truncate font-mono text-xs font-medium">
                  {node.column.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="sr-only">{t.dataSources.schemaColumnType}: </span>
                  {node.column.dataType}
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="sr-only">{t.dataSources.schemaColumnNullable}: </span>
                  {node.column.nullable
                    ? t.dataSources.nullableYes
                    : t.dataSources.nullableNo}
                </span>
              </>
            ) : (
              <span dir="auto" className="min-w-0 truncate">
                {node.label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
