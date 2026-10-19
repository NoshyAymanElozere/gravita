import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { mockRevenueData, mockCategoryData } from '@/constants/mockData'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Award, DollarSign, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/utils'
import { useTranslation } from 'react-i18next'

export default function Reports() {
  const { t } = useTranslation()

  const translatedCategoryData = mockCategoryData.map(c => {
    let key = 'luxuryPackages'
    if (c.name === 'Beach Resorts') key = 'beachResorts'
    if (c.name === 'Historical Tours') key = 'historicalTours'
    if (c.name === 'Adventure Safari') key = 'adventureSafari'
    if (c.name === 'City Sightseeing') key = 'citySightseeing'
    return { ...c, name: t(key) }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">{t('reports') || 'Reports'}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('reportsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('totalSales')}</p>
                <h4 className="text-xl font-bold mt-0.5">{formatCurrency(723000)}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('bookingGrowth')}</p>
                <h4 className="text-xl font-bold mt-0.5">+48.2% YOY</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('topDestination')}</p>
                <h4 className="text-xl font-bold mt-0.5">{t('topDestinationValue')}</h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-gray-100 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 px-6 py-4">
            <CardTitle className="text-base font-bold text-gray-800">{t('financialGrowth')}</CardTitle>
            <Badge variant="outline" className="font-semibold text-xs border-gray-100 text-gray-500">{t('annualYtd')}</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="revenue" name={t('revenue')} stroke="var(--main-color)" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                  <Line type="monotone" dataKey="expenses" name={t('expenses')} stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 px-6 py-4">
            <CardTitle className="text-base font-bold text-gray-800">{t('categoryShare')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={translatedCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Bar dataKey="value" name={t('valueSharePercent')} fill="var(--main-color)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
