import React, { useState, useEffect } from 'react'
import { Play, Pause, Square } from 'lucide-react'

interface TimeTrackerProps {
  initialHours?: number
  initialMinutes?: number
  initialSeconds?: number
}

import { useTranslation } from 'react-i18next'

export function TimeTracker({
  initialHours = 1,
  initialMinutes = 24,
  initialSeconds = 8
}: TimeTrackerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState({ hours: initialHours, minutes: initialMinutes, seconds: initialSeconds })
  const { t } = useTranslation()

  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setTime((prev) => {
          let s = prev.seconds + 1
          let m = prev.minutes
          let h = prev.hours
          if (s >= 60) {
            s = 0
            m += 1
          }
          if (m >= 60) {
            m = 0
            h += 1
          }
          return { hours: h, minutes: m, seconds: s }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (val: number) => String(val).padStart(2, '0')

  return (
    <div className="bg-black text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-44">
      <div className="absolute inset-0 bg-gradient-to-br from-main-start via-black to-black opacity-85 z-0" />
      
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="url(#wave-gradient-tracker)" />
          <defs>
            <linearGradient id="wave-gradient-tracker" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gradient-start)" />
              <stop offset="100%" stopColor="var(--gradient-end)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="z-10 relative">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">{t('timeTracker')}</span>
      </div>

      <div className="z-10 relative flex flex-col items-center my-1">
        <h2 className="text-3xl font-mono font-bold tracking-widest text-main-end">
          {formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}
        </h2>
      </div>

      <div className="z-10 relative flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-10 w-10 rounded-full bg-white hover:bg-gray-100 text-main flex items-center justify-center shadow-md transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4.5 w-4.5 fill-main text-main" /> : <Play className="h-4.5 w-4.5 fill-main text-main ml-0.5" />}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false)
            setTime({ hours: 0, minutes: 0, seconds: 0 })
          }}
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Stop"
        >
          <Square className="h-4 w-4 fill-white text-white" />
        </button>
      </div>
    </div>
  )
}
