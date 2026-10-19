import React from 'react'
import {
  ArrowUpRight, Plus, Download, Compass, Map, MapPin, Briefcase, Users, Globe, Landmark, Calendar, MoreHorizontal
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { WeeklyPillChart } from '@/features/dashboard/components/WeeklyPillChart'
import { TeamCollaboration } from '@/features/dashboard/components/TeamCollaboration'
import { MeetingReminder } from '@/features/dashboard/components/MeetingReminder'
import { ProjectProgressGauge } from '@/features/dashboard/components/ProjectProgressGauge'
import { TimeTracker } from '@/features/dashboard/components/TimeTracker'

import { useTranslation } from 'react-i18next'

export default function Dashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">{t('dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dashboardSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
            <Download className="h-4 w-4" /> {t('importData')}
          </button>
          <button className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-main text-white text-sm font-semibold hover:opacity-90 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> {t('new') || '+ New'}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Travel Packages (Brand Gradient Card) */}
        <div className="bg-main-gradient text-white rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium opacity-90">{t('travelPackages')}</span>
            <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">48</h2>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex h-5 items-center justify-center rounded-md bg-white/15 px-2 text-[10px] font-bold text-white">
                +12%
              </span>
              <span className="text-[10px] opacity-75 font-semibold">{t('increasedFromLastMonth')}</span>
            </div>
          </div>
        </div>

        {/* Tourist Destinations */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">{t('touristDestinations')}</span>
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <Map className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight">18</h2>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex h-5 items-center justify-center rounded-md bg-green-50 px-2 text-[10px] font-bold text-emerald-700">
                Active
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">Across 5 Countries</span>
            </div>
          </div>
        </div>

        {/* Tourist Attractions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">{t('touristAttractions')}</span>
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight">124</h2>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex h-5 items-center justify-center rounded-md bg-green-50 px-2 text-[10px] font-bold text-emerald-700">
                +8%
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">New attractions added</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-gray-400">{t('totalBookings') || 'Total Bookings'}</span>
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight">1,842</h2>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="flex h-5 items-center justify-center rounded-md bg-green-50 px-2 text-[10px] font-bold text-emerald-700">
                +18.2%
              </span>
              <span className="text-[10px] text-gray-400 font-semibold">{t('increasedFromLastMonth')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Analytics + Collaboration */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Reusable Project Analytics Weekly Pill Chart */}
          <WeeklyPillChart />

          {/* Reusable Team Collaboration Card */}
          <TeamCollaboration />
        </div>

        {/* Right Column: Reminders, Project List, Progress, Time Tracker */}
        <div className="space-y-6">
          {/* Reusable Reminders Card */}
          <MeetingReminder />

          {/* Featured Travel Packages List */}
          <Card className="border border-gray-100 rounded-2xl shadow-xs bg-white">
            <div className="p-6 pb-2 flex justify-between items-center">
              <h3 className="font-bold text-[#111827] text-base">{t('featuredPackages')}</h3>
              <button className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-100 py-1 px-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                {t('new')}
              </button>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { title: 'Dubai Luxury Desert Getaway', due: 'July 15, 2026', icon: Globe, iconColor: 'text-blue-500 bg-blue-50' },
                  { title: 'Cairo Historical Pyramids Tour', due: 'July 20, 2026', icon: Landmark, iconColor: 'text-amber-500 bg-amber-50' },
                  { title: 'Paris Honeymoon Package', due: 'August 01, 2026', icon: Briefcase, iconColor: 'text-main bg-main/10' },
                  { title: 'Sharm El Sheikh Resort Stay', due: 'August 10, 2026', icon: Calendar, iconColor: 'text-indigo-500 bg-indigo-50' },
                  { title: 'Siwa Oasis Adventure Trip', due: 'August 24, 2026', icon: Compass, iconColor: 'text-purple-500 bg-purple-50' }
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">{t('due')}: {item.due}</p>
                        </div>
                      </div>
                      <button className="h-6 w-6 text-gray-300 hover:text-gray-500">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reusable Project Progress Gauge */}
          <ProjectProgressGauge />

          {/* Reusable Time Tracker Card */}
          <TimeTracker />
        </div>
      </div>
    </div>
  )
}
