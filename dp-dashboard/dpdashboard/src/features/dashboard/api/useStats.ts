import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'
import type { AdminStats, ApiEnvelope } from '@/types/api'
import { getToken } from '@/features/auth/lib/authStorage'

export const statsKeys = {
  all: ['stats'] as const,
  period: (days: number) => ['stats', days] as const,
}

const fetchStats = async (days: number) =>
  (await api.get<ApiEnvelope<AdminStats>>('/admin/stats', { params: { days } })).data.data

export function useStats(days: number) {
  return useQuery({
    queryKey: statsKeys.period(days),
    queryFn: () => fetchStats(days),
    placeholderData: (prev) => prev,
  })
}

/**
 * Counters for the header bell / sidebar badge. `ordersByStatus` and `lowStock`
 * are not limited by the period, so the default 30-day query is reused.
 */
export function useOrderAlerts() {
  return useQuery({
    queryKey: statsKeys.period(30),
    queryFn: () => fetchStats(30),
    enabled: !!getToken(),
    refetchInterval: 60_000,
    select: (s) => {
      const pending = s.ordersByStatus.pending ?? 0
      const returnRequested = s.ordersByStatus.return_requested ?? 0
      return { pending, returnRequested, lowStock: s.lowStock.length, attention: pending + returnRequested }
    },
  })
}
