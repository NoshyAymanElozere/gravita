import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { useTouristDestination } from '../../api/useTouristDestinations'
import { useTouristProgramsList } from '../../api/useTouristPrograms'
import { getProgramsColumnDefs } from './ProgramsColumnDefs'
import { ArrowLeft, Edit3, MapPin, Eye, ImageIcon } from 'lucide-react'

export default function TouristDestinationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const [programsPage, setProgramsPage] = useState(1)
  const { data: destination, isLoading } = useTouristDestination(id ? Number(id) : null)
  const { data: programsData, isLoading: programsLoading } = useTouristProgramsList(programsPage, '', id)

  const columnDefs = getProgramsColumnDefs({ t })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main" />
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Tourist Destination not found.
      </div>
    )
  }

  const name = destination.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.name || destination.name || ''
  const description = destination.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.description || destination.description || ''
  const cityName = destination.city?.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.name || destination.city?.name || ''
  const countryName = destination.city?.country?.translations?.find((t: any) => t.language_id === (isRtl ? 2 : 1))?.name || destination.city?.country?.name || ''

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header card with back button */}
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings/touristdestinations')}
            className="h-8 w-8 rounded-lg"
          >
            <ArrowLeft className={isRtl ? 'rotate-180 h-4 w-4' : 'h-4 w-4'} />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
        </div>
        <Button onClick={() => navigate(`/settings/touristdestinations/${destination.id}/edit`)} className="h-9 px-4 rounded-xl">
          <Edit3 className="mr-2 h-4 w-4" /> {t('edit') || 'Edit'}
        </Button>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Destination Image Showcase (First) */}
        <Card className="h-full border-slate-200/80 shadow-sm rounded-2xl bg-slate-50/90 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 px-6 py-5">
            <CardTitle className="text-md font-bold text-gray-500 uppercase tracking-wider">
              {t('mediaShowcase') || 'Media Showcase'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('mainImage') || 'Main Image'}</span>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-gray-50">
                {destination.image_url ? (
                  <img src={destination.image_url} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-xs font-bold">No Image Available</span>
                  </div>
                )}
              </div>
            </div>

            {destination.gallery && destination.gallery.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('gallery') || 'Gallery'}</span>
                <div className="grid grid-cols-3 gap-2">
                  {destination.gallery.map((g: any, index: number) => (
                    <div key={g.id || index} className="aspect-square rounded-lg border border-border overflow-hidden bg-gray-50 hover:opacity-80 transition-opacity cursor-pointer">
                      <img src={g.file_path} alt="gallery-item" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info (Second, span-2) */}
        <Card className="lg:col-span-2 h-full border-slate-200/80 shadow-sm rounded-2xl bg-slate-50/90 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 px-6 py-5">
            <CardTitle className="text-md font-bold text-gray-500 uppercase tracking-wider">
              {t('basicInfo') || 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('country') || 'Country'}</span>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <MapPin className="h-4 w-4 text-main" />
                  <span>{countryName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('city') || 'City'}</span>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <MapPin className="h-4 w-4 text-main" />
                  <span>{cityName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('status') || 'Status'}</span>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${destination.is_active
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${destination.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {destination.is_active ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('description') || 'Description'}</span>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tourist Programs Table */}
      <Card className="border-slate-200/80 shadow-sm rounded-2xl bg-slate-50/90 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
          <CardTitle className="text-md font-bold text-gray-700">
            {t('touristPrograms') || 'Tourist Programs'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <GenericDataGrid
            rowData={programsData?.data || []}
            columnDefs={columnDefs}
            rowHeight={50}
            headerHeight={50}
            loading={programsLoading}
            isServerSide
            currentPage={programsPage}
            totalPages={programsData?.meta?.last_page || programsData?.last_page || 1}
            onPageChange={setProgramsPage}
            paginationLinks={programsData?.meta?.links || programsData?.links}
            onViewRow={(data) => navigate(`/settings/touristprograms/${data.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
