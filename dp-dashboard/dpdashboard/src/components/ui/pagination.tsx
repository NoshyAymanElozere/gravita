import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Button } from './button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  showEdges?: boolean
  siblings?: number
}

function getRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function getPages(current: number, total: number, siblings = 1): (number | '...')[] {
  const totalSlots = siblings * 2 + 5
  if (total <= totalSlots) return getRange(1, total)

  const leftSibling = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)
  const showLeft = leftSibling > 2
  const showRight = rightSibling < total - 1

  if (!showLeft && showRight) {
    const leftRange = getRange(1, 3 + siblings * 2)
    return [...leftRange, '...', total]
  }
  if (showLeft && !showRight) {
    const rightRange = getRange(total - (3 + siblings * 2 - 1), total)
    return [1, '...', ...rightRange]
  }
  return [1, '...', ...getRange(leftSibling, rightSibling), '...', total]
}

export function Pagination({ page, totalPages, onPageChange, siblings = 1 }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = getPages(page, totalPages, siblings)

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── Page size selector ───────────────────────────────────────────────────────

interface PageSizeSelectorProps {
  pageSize: number
  options?: number[]
  onChange: (size: number) => void
}

export function PageSizeSelector({ pageSize, options = [10, 25, 50, 100], onChange }: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows per page</span>
      <select
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'h-8 rounded-md border border-input bg-transparent px-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
