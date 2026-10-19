import { QueryClient } from '@tanstack/react-query'
import { getApiErrorStatus } from './axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 10,
      // Client errors (4xx) will not fix themselves — only retry network/5xx once
      retry: (failureCount, error) => {
        const status = getApiErrorStatus(error)
        if (status && status < 500) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
