import { useState, useCallback } from 'react'

interface TableState {
  page: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function useTableState(defaults?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...defaults,
  })

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), [])
  const setPageSize = useCallback((pageSize: number) => setState((s) => ({ ...s, page: 1, pageSize })), [])
  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, page: 1, search })),
    []
  )
  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') =>
    setState((s) => ({ ...s, sortBy, sortOrder })), [])
  const reset = useCallback(() => setState({
    page: 1, pageSize: defaults?.pageSize ?? 10, search: '',
    sortBy: defaults?.sortBy ?? 'createdAt', sortOrder: defaults?.sortOrder ?? 'desc',
  }), [defaults])

  return { ...state, setPage, setPageSize, setSearch, setSort, reset }
}
