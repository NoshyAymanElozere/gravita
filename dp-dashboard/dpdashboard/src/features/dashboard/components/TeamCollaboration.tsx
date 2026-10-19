import React from 'react'
import { UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/shared/misc'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

export interface TeamMember {
  name: string
  role: string
  status: string
  statusColor: string
}

interface TeamCollaborationProps {
  title?: string
  members?: TeamMember[]
}

const defaultMembers: TeamMember[] = [
  {
    name: 'Alexandra Deff',
    role: 'Working on Github Project Repository',
    status: 'Completed',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  {
    name: 'Edwin Adenike',
    role: 'Working on Integrate User Authentication System',
    status: 'In Progress',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-100'
  },
  {
    name: 'Isaac Oluwatemilorun',
    role: 'Working on Develop Search and Filter Functionality',
    status: 'Pending',
    statusColor: 'bg-red-50 text-red-700 border-red-100'
  },
  {
    name: 'David Oshodi',
    role: 'Working on Responsive Layout for Homepage',
    status: 'In Progress',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-100'
  }
]

import { useTranslation } from 'react-i18next'

export function TeamCollaboration({ title, members = defaultMembers }: TeamCollaborationProps) {
  const { t } = useTranslation()
  const displayTitle = title || t('teamCollaboration')

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-xs bg-white">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h3 className="font-bold text-[#111827] text-base">{displayTitle}</h3>
        <button className="flex items-center gap-1 text-xs font-bold text-main border border-main/10 bg-main/5 py-1.5 px-3 rounded-lg hover:bg-main/10 transition-colors">
          <UserPlus className="h-3.5 w-3.5" /> {t('addMember')}
        </button>
      </div>
      <CardContent className="p-6">
        <div className="divide-y divide-gray-100">
          {members.map((member, idx) => (
            <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} size="sm" className="h-9 w-9 text-xs font-bold bg-main/10 text-main" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{member.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
                </div>
              </div>
              <Badge className={cn('text-[10px] font-bold px-2 py-0.5 border', member.statusColor)} variant="outline">
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
