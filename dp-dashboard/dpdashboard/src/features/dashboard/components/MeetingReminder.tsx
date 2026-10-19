import React from 'react'
import { Clock, Video, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MeetingReminderProps {
  title?: string
  meetingTitle?: string
  time?: string
  onStartMeeting?: () => void
}

import { useTranslation } from 'react-i18next'

export function MeetingReminder({
  title,
  meetingTitle,
  time,
  onStartMeeting
}: MeetingReminderProps) {
  const { t } = useTranslation()
  const displayTitle = title || t('reminders')
  const displayMeetingTitle = meetingTitle || t('meetingWithArc')
  const displayTime = time || t('timeRange')

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-xs bg-white">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h3 className="font-bold text-[#111827] text-base">{displayTitle}</h3>
        <button className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-800 tracking-tight">{displayMeetingTitle}</h4>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
              <Clock className="h-3.5 w-3.5" /> {t('time') || 'Time'}: {displayTime}
            </div>
          </div>
          <button
            onClick={onStartMeeting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-main-gradient text-white text-xs font-bold hover:opacity-95 transition-all"
          >
            <Video className="h-4 w-4" /> {t('startMeeting')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
