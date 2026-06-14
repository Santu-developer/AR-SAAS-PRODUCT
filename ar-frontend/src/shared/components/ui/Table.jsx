// ─── src/shared/components/ui/Table.jsx ──────────────────────────────────
// Responsive Table component — renders as card list on mobile
// Premium dark theme with hover states and sort indicators.
// ──────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Skeleton } from './Skeleton';

/**
 * Table — responsive data table with mobile card fallback.
 *
 * Columns define the data structure and mobile conversion behavior.
 * On mobile (< 768px), each row becomes a card with label:value pairs.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, render?: Function, sortable?: boolean, hideOnMobile?: boolean, mobileLabel?: string}>} props.columns
 * @param {Array} props.data - Row data array
 * @param {Function} props.onRowClick - Row click handler
 * @param {boolean} props.loading - Show skeleton loading
 * @param {boolean} props.isLoading - Alias for loading
 * @param {string} props.emptyMessage - Empty state message
 * @param {string} props.className
 */
export function Table({
  columns = [],
  data = [],
  onRowClick,
  loading,
  isLoading,
  emptyMessage = 'No data available',
  sortKey,
  sortDirection,
  onSort,
  className,
}) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const _loading = loading || isLoading;

  if (_loading) {
    return <TableSkeleton columns={columns} rows={5} isMobile={!!isMobile} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-card/30 py-16 px-4">
        <p className="text-sm text-muted-foreground/60">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile: Card Layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((row, rowIndex) => (
          <motion.div
            key={row.id || rowIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.03 }}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'rounded-xl border border-white/[0.06] bg-card/40 p-4 backdrop-blur-sm transition-all',
              onRowClick && 'cursor-pointer hover:bg-card/60 hover:border-primary/20'
            )}
          >
            <div className="space-y-2.5">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground/60">
                      {col.mobileLabel || col.label}
                    </span>
                    <span className="text-sm font-medium text-foreground text-right">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Desktop: Standard Table
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm">
      <table className="w-full">
        {/* Header */}
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={cn(
                  'px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/70',
                  col.sortable && 'cursor-pointer hover:text-foreground select-none',
                  col.align === 'right' && 'text-right'
                )}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col">
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={12} className="text-primary" />
                        ) : (
                          <ChevronDown size={12} className="text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown size={12} className="text-muted-foreground/30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id || rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.02 }}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-white/[0.03] transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-white/[0.02]'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-sm text-foreground',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] ?? '-'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Table Skeleton ────────────────────────────────────────────────────────
function TableSkeleton({ columns, rows = 5, isMobile }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-card/40 p-4">
            <div className="space-y-2.5">
              {columns.slice(0, 3).map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card/40">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3.5">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-white/[0.03]">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
