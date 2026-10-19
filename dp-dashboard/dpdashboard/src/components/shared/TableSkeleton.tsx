import React from 'react'

interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full border border-border/60 rounded-2xl overflow-hidden bg-card animate-pulse">
      {/* Header Row Skeleton */}
      <div className="flex border-b border-border/50 bg-muted/20 px-6 py-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded-md flex-1"
            style={{ marginRight: i < cols - 1 ? '1.5rem' : '0' }}
          />
        ))}
      </div>

      {/* Data Rows Skeleton */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex px-6 py-4 items-center">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-3.5 bg-muted/60 rounded-md flex-1"
                style={{
                  marginRight: colIndex < cols - 1 ? '1.5rem' : '0',
                  width: colIndex === 0 ? '70%' : '100%'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
