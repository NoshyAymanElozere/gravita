import React from 'react'
import { cn } from '@/utils/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export interface WeeklyData {
  day: string
  val: string
  type: 'striped' | 'solid' | 'light' | 'dark-solid'
  tooltip?: string
}

interface WeeklyPillChartProps {
  title?: string
  data?: WeeklyData[]
}

const defaultData: WeeklyData[] = [
  { day: 'S', val: '40%', type: 'striped' },
  { day: 'M', val: '75%', type: 'solid' },
  { day: 'T', val: '60%', type: 'light', tooltip: '74%' },
  { day: 'W', val: '95%', type: 'dark-solid' },
  { day: 'T', val: '45%', type: 'striped' },
  { day: 'F', val: '70%', type: 'striped' },
  { day: 'S', val: '50%', type: 'striped' }
]

import { useTranslation } from 'react-i18next'

export function WeeklyPillChart({ title, data = defaultData }: WeeklyPillChartProps) {
  const { t } = useTranslation()
  const displayTitle = title || t('projectAnalytics')

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-xs overflow-hidden bg-white">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h3 className="font-bold text-[#111827] text-base">{displayTitle}</h3>
        <Badge variant="outline" className="font-semibold text-xs border-gray-100 text-gray-500">{t('weekly')}</Badge>
      </div>
      <CardContent className="p-6 pt-0">
        <div className="flex justify-between items-end h-56 pt-8 px-2 relative">
          <div className="absolute inset-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none opacity-[0.03]">
            <div className="border-t border-black w-full" />
            <div className="border-t border-black w-full" />
            <div className="border-t border-black w-full" />
          </div>

          {data.map((col, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 gap-3 relative group" style={{ zIndex: 10 }}>
              {col.tooltip && (
                <span className="absolute -top-7 px-2 py-0.5 rounded-md bg-main text-white text-[10px] font-bold shadow-xs">
                  {col.tooltip}
                </span>
              )}

              <div className="w-9 sm:w-11 h-36 bg-gray-50 rounded-full overflow-hidden flex flex-col justify-end relative">
                <div
                  style={{ height: col.val }}
                  className={cn(
                    'w-full rounded-full transition-all duration-500 group-hover:opacity-90',
                    col.type === 'striped' && 'bg-gradient-to-t from-gray-100 to-gray-200 border-2 border-dashed border-gray-300',
                    col.type === 'solid' && 'bg-main',
                    col.type === 'light' && 'bg-main-end/70',
                    col.type === 'dark-solid' && 'bg-main-start'
                  )}
                />
              </div>
              <span className="text-xs font-bold text-gray-400">{col.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
