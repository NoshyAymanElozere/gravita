import * as React from 'react'
import { cn } from '@/utils/utils'

// ─── Table Primitives ──────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm border-collapse', className)} {...props} />
    </div>
  )
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/40', className)} {...props} />
  )
)
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-gray-100/65 dark:divide-zinc-800/50', className)} {...props} />
  )
)
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t dark:border-zinc-800 bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
)
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-850/40 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle font-bold text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle text-sm text-gray-600 dark:text-zinc-300 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
)
TableCaption.displayName = 'TableCaption'

// ─── Empty Table State ────────────────────────────────────────────────────────

function TableEmpty({ message = 'No data found.', colSpan = 5 }: { message?: string; colSpan?: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-36 text-center text-gray-400 dark:text-zinc-500 font-medium">
        {message}
      </TableCell>
    </TableRow>
  )
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full rounded bg-gray-100 dark:bg-zinc-800/60 animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ─── Reusable DataTable Component ─────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string
  label: string
  headerClassName?: string
  cellClassName?: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  rowClassName?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No matching records found.',
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.headerClassName}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton rows={5} cols={columns.length} />
          ) : data.length === 0 ? (
            <TableEmpty message={emptyMessage} colSpan={columns.length} />
          ) : (
            data.map((item, rowIdx) => (
              <TableRow
                key={item.id ?? rowIdx}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-800/20',
                  rowClassName
                )}
              >
                {columns.map((col) => {
                  const value = item[col.key]
                  return (
                    <TableCell key={col.key} className={col.cellClassName}>
                      {col.render ? col.render(value, item) : value}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
  TableSkeleton,
}
