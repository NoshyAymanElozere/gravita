import React from 'react'
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/utils'

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule])

// Modern theme with light and dark color schemes matching wathiqa brand
export const customTheme = themeQuartz
  .withParams({
    browserColorScheme: 'light',
    accentColor: '#5c66ae',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#1a1f36',
    borderColor: '#e4e7ec',
    borderRadius: 10,
    headerBackgroundColor: '#f8f9fc',
    headerTextColor: '#64748b',
    headerFontWeight: 600,
    headerFontSize: 13,
    fontSize: 14,
    rowBorder: { color: '#f1f3f9', width: 1, style: 'solid' },
    columnBorder: false,
    rowHoverColor: 'rgba(92, 102, 174, 0.04)',
    selectedRowBackgroundColor: 'rgba(92, 102, 174, 0.08)',
    rangeSelectionBackgroundColor: 'rgba(92, 102, 174, 0.12)',
    cellHorizontalPadding: 16,
    headerColumnResizeHandleColor: '#5c66ae',
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
    wrapperBorderRadius: 12,
    spacing: 6,
    oddRowBackgroundColor: '#fafafd',
  }, 'light')
  .withParams({
    browserColorScheme: 'dark',
    accentColor: '#3b82f6',
    backgroundColor: '#0f1629',
    foregroundColor: '#e2e8f0',
    borderColor: '#1e2a4a',
    borderRadius: 10,
    headerBackgroundColor: '#131b32',
    headerTextColor: '#7c8db5',
    headerFontWeight: 600,
    headerFontSize: 13,
    fontSize: 14,
    rowBorder: { color: '#1a2440', width: 1, style: 'solid' },
    columnBorder: false,
    rowHoverColor: 'rgba(59, 130, 246, 0.06)',
    selectedRowBackgroundColor: 'rgba(59, 130, 246, 0.1)',
    rangeSelectionBackgroundColor: 'rgba(59, 130, 246, 0.15)',
    cellHorizontalPadding: 16,
    headerColumnResizeHandleColor: '#3b82f6',
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
    wrapperBorderRadius: 12,
    spacing: 6,
    oddRowBackgroundColor: '#111a30',
  }, 'dark')

const CustomLoadingOverlay = () => {
  return (
    <div className="absolute inset-0 flex flex-col bg-card/60 backdrop-blur-[1px] z-50 p-4">
      <div className="w-full space-y-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex gap-4 items-center py-3 border-b border-border/10">
            <div className="h-4 bg-muted/80 rounded-md flex-1" />
            <div className="h-4 bg-muted/80 rounded-md flex-1" />
            <div className="h-4 bg-muted/80 rounded-md flex-1" />
            <div className="h-4 bg-muted/80 rounded-md flex-1" />
            <div className="h-4 bg-muted/80 rounded-md flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

const CustomNoRowsOverlay = () => {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none min-h-[240px]">
      <div className="relative mb-3 flex items-center justify-center">
        {/* Soft Ambient Glow (Frameless) */}
        <div className="absolute w-28 h-28 rounded-full bg-primary/10 dark:bg-primary/20 blur-2xl animate-pulse pointer-events-none" />

        {/* Frameless Floating Expressive SVG Icon */}
        <svg
          className="w-24 h-24 relative z-10 transition-transform hover:scale-105 duration-300 drop-shadow-md"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="framelessGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5c66ae" />
              <stop offset="100%" stopColor="#485199" />
            </linearGradient>
            <linearGradient id="lensGrad" x1="50" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.3" />
            </linearGradient>
            <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#5c66ae" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Dotted Accent Ring */}
          <circle cx="60" cy="60" r="50" stroke="#5c66ae" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.25" />

          {/* Frameless Floating Box / Document Canvas */}
          <rect x="28" y="34" width="64" height="52" rx="16" fill="url(#framelessGrad)" fillOpacity="0.08" stroke="url(#framelessGrad)" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="40" y="47" width="40" height="5" rx="2.5" fill="url(#framelessGrad)" fillOpacity="0.25" />
          <rect x="40" y="58" width="26" height="5" rx="2.5" fill="url(#framelessGrad)" fillOpacity="0.15" />

          {/* Expressive Floating Glass Search Lens */}
          <g filter="url(#iconShadow)">
            <circle cx="76" cy="70" r="17" fill="url(#framelessGrad)" />
            <circle cx="76" cy="70" r="12" fill="url(#lensGrad)" />
            <line x1="88" y1="82" x2="99" y2="93" stroke="url(#framelessGrad)" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* Sparkles */}
          <path d="M24 26L26 30L30 32L26 34L24 38L22 34L18 32L22 30L24 26Z" fill="#F59E0B" />
          <circle cx="98" cy="30" r="3.5" fill="#38BDF8" />
        </svg>
      </div>

      <h4 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
        {isRtl ? 'لا توجد بيانات لعرضها' : 'No Data Available'}
      </h4>
    </div>
  )
}

interface GenericDataGridProps<TData = any> extends AgGridReactProps<TData> {
  loading?: boolean
  height?: string | number
  onViewRow?: (data: TData) => void
  isServerSide?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  paginationLinks?: Array<{ url: string | null; label: string; active: boolean }>
}

function getPaginationItems(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}

export function GenericDataGrid<TData = any>({
  rowData,
  columnDefs,
  loading = false,
  height = 600,
  onViewRow,
  isServerSide = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  paginationLinks,
  ...props
}: GenericDataGridProps<TData>) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'

  const [gridApi, setGridApi] = React.useState<any>(null)
  const [columns, setColumns] = React.useState<any[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
    const allCols = params.api.getColumns() || []
    setColumns(
      allCols.map((col: any) => ({
        id: col.getColId(),
        name: col.getColDef().headerName || col.getColId(),
        visible: col.isVisible()
      }))
    )
    if (props.onGridReady) {
      props.onGridReady(params)
    }
  }

  const toggleColumn = (colId: string) => {
    if (!gridApi) return
    const col = columns.find((c) => c.id === colId)
    if (!col) return
    const nextVisible = !col.visible
    gridApi.setColumnsVisible([colId], nextVisible)
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, visible: nextVisible } : c))
    )
  }

  const defaultColDef = React.useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      filter: false,
      sortable: true,
      resizable: true,
      ...props.defaultColDef
    }
  }, [props.defaultColDef])

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-end relative z-10">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-card text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 active:scale-95 shadow-sm border border-border/60 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
            <span>{isRtl ? 'تعديل الأعمدة' : 'Columns'}</span>
          </button>

          {isOpen && (
            <div className={`absolute top-full mt-2 w-60 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-md p-2.5 shadow-xl shadow-black/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${isRtl ? 'left-0' : 'right-0'}`}>
              <div className="px-2.5 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80 border-b border-border/40 mb-2">
                {isRtl ? 'إظهار وإخفاء الأعمدة' : 'Show / Hide Columns'}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                {columns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-150 cursor-pointer text-xs font-semibold text-foreground/90 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(col.id)}
                      className="accent-primary h-4 w-4 rounded-md border-border/60 cursor-pointer"
                    />
                    <span>{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full animate-fade-in overflow-x-auto" style={{ height }}>
        <AgGridReact
          theme={customTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          enableRtl={isRtl}
          loading={loading}
          loadingOverlayComponent={CustomLoadingOverlay}
          noRowsOverlayComponent={CustomNoRowsOverlay}
          pagination={isServerSide ? false : (props.pagination ?? true)}
          paginationPageSize={props.paginationPageSize ?? 10}
          paginationPageSizeSelector={props.paginationPageSizeSelector ?? [10, 20, 50, 100]}
          {...props}
          // After the spread so the caller's raw props don't override the merged / wrapped versions
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowDoubleClicked={(event) => {
            if (onViewRow && event.data) {
              onViewRow(event.data)
            }
            if (props.onRowDoubleClicked) {
              props.onRowDoubleClicked(event)
            }
          }}
        />
      </div>

      {isServerSide && (
        <div className="flex items-center justify-between px-4 py-3 bg-card border border-border/60 rounded-2xl mt-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="text-xs font-bold text-muted-foreground">
            {isRtl ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </div>
          <div className="flex items-center gap-1.5">
            {paginationLinks && paginationLinks.length > 0 ? (
              paginationLinks.map((link, idx) => {
                const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;')
                const isNext = link.label.includes('Next') || link.label.includes('&raquo;')

                let cleanLabel = link.label
                  .replace('&laquo; ', '')
                  .replace(' &raquo;', '')
                  .replace('&laquo;', '')
                  .replace('&raquo;', '')
                  .replace('Previous', '')
                  .replace('Next', '')
                  .trim()

                if (cleanLabel === '...' || link.label.includes('...')) {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="h-8 min-w-8 px-1 flex items-center justify-center text-xs font-black text-muted-foreground select-none"
                    >
                      ...
                    </span>
                  )
                }

                const pageMatch = link.url ? link.url.match(/page=(\d+)/) : null
                const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : null

                return (
                  <button
                    key={idx}
                    onClick={() => pageNum && onPageChange?.(pageNum)}
                    disabled={!link.url}
                    className={cn(
                      "h-8 min-w-8 px-2 flex items-center justify-center rounded-lg border text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer",
                      link.active
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "border-border/60 text-foreground hover:bg-primary/5 hover:border-primary/30"
                    )}
                  >
                    {isPrev ? (
                      isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
                    ) : isNext ? (
                      isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : (
                      cleanLabel
                    )}
                  </button>
                )
              })
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.max((currentPage || 1) - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/60 text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                {getPaginationItems(currentPage || 1, Number(totalPages) || 1).map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="h-8 min-w-8 px-1 flex items-center justify-center text-xs font-black text-muted-foreground select-none"
                      >
                        ...
                      </span>
                    )
                  }

                  const pageNum = item
                  return (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={cn(
                        "h-8 min-w-8 px-2 flex items-center justify-center rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer",
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "border-border/60 text-foreground hover:bg-primary/5 hover:border-primary/30"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => onPageChange?.(Math.min((currentPage || 1) + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/60 text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
