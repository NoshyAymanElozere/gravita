import { useQuery } from '@tanstack/react-query'
import api from '@/services/axios'
import type { ApiEnvelope, SalesReport } from '@/types/api'

export const reportKeys = {
  all: ['report'] as const,
  range: (from: string, to: string) => ['report', from, to] as const,
}

export function useSalesReport(from: string, to: string) {
  return useQuery({
    queryKey: reportKeys.range(from, to),
    queryFn: async () =>
      (await api.get<ApiEnvelope<SalesReport>>('/admin/stats/report', { params: { from, to } })).data.data,
    enabled: !!from && !!to && from <= to,
    placeholderData: (prev) => prev,
  })
}

/** Download every order in the period as a CSV file (served by the API) */
export async function downloadReportCsv(from: string, to: string) {
  const res = await api.get<Blob>('/admin/stats/report', {
    params: { from, to, format: 'csv' },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-report-${from}_${to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
