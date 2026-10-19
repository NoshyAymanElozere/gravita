import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'

export default function Analytics() {
  const { t } = useTranslation()

  const trafficSources = [
    { source: t('direct'), visits: 12500, conversion: 2.8 },
    { source: t('organicSearch'), visits: 48200, conversion: 3.4 },
    { source: t('referrals'), visits: 8600, conversion: 4.1 },
    { source: t('socialMedia'), visits: 15400, conversion: 1.9 }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{t('analytics') || 'Analytics'}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('analyticsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-gray-100 shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 px-6 py-4">
            <CardTitle className="text-base font-bold text-gray-800">{t('trafficSourceBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="visits" name={t('visits')} fill="var(--main-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 px-6 py-4">
            <CardTitle className="text-base font-bold text-gray-800">{t('conversionBenchmarks')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {trafficSources.map((tSource, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{tSource.source}</span>
                    <span className="font-extrabold text-main">{tSource.conversion}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div style={{ width: `${tSource.conversion * 20}%` }} className="h-full bg-main rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
