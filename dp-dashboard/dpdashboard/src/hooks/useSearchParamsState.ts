import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * List filters kept in the URL (?status=pending&page=2) so links from the overview /
 * notifications land on a pre-filtered list and filters survive a refresh.
 */
export function useSearchParamsState<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams()

  const values = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ''])) as Record<K, string>
  const page = Math.max(1, Number(params.get('page')) || 1)

  const set = useCallback(
    (patch: Partial<Record<K | 'page', string | number | null | undefined>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === null || v === '' || v === 'all') next.delete(k)
            else next.set(k, String(v))
          }
          // Any filter change resets pagination
          if (!('page' in patch)) next.delete('page')
          return next
        },
        { replace: true }
      )
    },
    [setParams]
  )

  return { values, page, set }
}
