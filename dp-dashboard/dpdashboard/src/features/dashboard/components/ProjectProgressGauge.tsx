import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ProjectProgressGaugeProps {
  title?: string
  percentage?: number // out of 100
  label?: string
}

import { useTranslation } from 'react-i18next'

export function ProjectProgressGauge({
  title,
  percentage = 41,
  label
}: ProjectProgressGaugeProps) {
  const { t } = useTranslation()
  const displayTitle = title || t('projectProgress')
  const displayLabel = label || t('projectEnded')

  // calculate stroke dash array or coordinate if using precise svg
  // For a simple semi-circular gauge, we can render using SVG path.
  // The path starts at bottom left and loops to bottom right (A 40 40 0 0 1 90 50)
  // Let's approximate the highlight overlay path length.
  // Full semi-circle is 180 degrees. If percentage is p, angle = p * 1.8 degrees.
  const angle = percentage * 1.8
  const rad = (Math.PI / 180) * (180 - angle)
  const x = 50 + 40 * Math.cos(rad)
  const y = 50 - 40 * Math.sin(rad)

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-xs bg-white">
      <div className="p-6 pb-2">
        <h3 className="font-bold text-[#111827] text-base">{displayTitle}</h3>
      </div>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        {/* Semi-circular gauge */}
        <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 50">
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--gradient-start)" />
                <stop offset="100%" stopColor="var(--gradient-end)" />
              </linearGradient>
            </defs>
            {/* Gray background track */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Highlight track */}
            <path
              d={`M 10 50 A 40 40 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center z-10">
            <h4 className="text-3xl font-extrabold text-[#111827] tracking-tight">{percentage}%</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{displayLabel}</p>
          </div>
        </div>

        {/* Legends */}
        <div className="flex gap-4 mt-6 text-[10px] font-bold text-gray-400">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-main-end" /> {t('completed')}
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-main" /> {t('inProgress')}
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-200" /> {t('pending')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
