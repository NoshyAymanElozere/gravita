import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import { ModalStatus } from '@/components/shared/modal-status'
import { Plus, Users, ShieldCheck, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useCompanyTeamList,
  useCreateTeamMember,
  useUpdateTeamMember,
  useToggleTeamStatus,
  useDeleteTeamMember,
  type CompanyStaffMember
} from '../api/useCompanyTeam'
import { getCompanyTeamColumnDefs } from '../components/ColumnDefs'
import { TeamFormModal, type TeamFormData } from './TeamFormModal'

export default function CompanyTeamList() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl'
  const [search, setSearch] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [editingItem, setEditingItem] = useState<CompanyStaffMember | null>(null)
  const [deletingItem, setDeletingItem] = useState<CompanyStaffMember | null>(null)

  const { data: items = [], isLoading, refetch, isRefetching } = useCompanyTeamList()
  const createMutation = useCreateTeamMember()
  const updateMutation = useUpdateTeamMember()
  const toggleStatusMutation = useToggleTeamStatus()
  const deleteMutation = useDeleteTeamMember()

  const filteredItems = useMemo(() => {
    if (!search) return items
    const query = search.toLowerCase()
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
    )
  }, [items, search])

  const handleAddClick = () => {
    setEditingItem(null)
    setIsViewOnly(false)
    setIsFormOpen(true)
  }

  const handleEditClick = (item: CompanyStaffMember) => {
    setEditingItem(item)
    setIsViewOnly(false)
    setIsFormOpen(true)
  }

  const handleViewClick = (item: CompanyStaffMember) => {
    setEditingItem(item)
    setIsViewOnly(true)
    setIsFormOpen(true)
  }

  const handleSave = (data: TeamFormData) => {
    if (editingItem) {
      updateMutation.mutate(
        {
          id: editingItem.id,
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            status: data.is_active ? 'active' : 'inactive'
          }
        },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingItem(null)
          }
        }
      )
    } else {
      createMutation.mutate(
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.is_active ? 'active' : 'inactive'
        },
        {
          onSuccess: () => {
            setIsFormOpen(false)
          }
        }
      )
    }
  }

  const confirmDelete = () => {
    if (!deletingItem) return
    deleteMutation.mutate(deletingItem.id, {
      onSuccess: () => {
        setDeletingItem(null)
      }
    })
  }

  const columnDefs = getCompanyTeamColumnDefs({
    t,
    onViewClick: handleViewClick,
    onEditClick: handleEditClick,
    onDeleteClick: (item) => setDeletingItem(item),
    onToggleStatus: async (item) => {
      await toggleStatusMutation.mutateAsync(item.id)
    }
  })

  return (
    <div className="space-y-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-zinc-100">
                {t('team') || 'فريق عمل وموظفي الشركة'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                إدارة حسابات منسوبي الشركة، مسؤولي المطالبات، والمحاسبين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              onClick={handleAddClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-xs gap-2 cursor-pointer h-10"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة جديد</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.success('جاري تصدير أعضاء الفريق...')}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-transparent font-bold px-4 py-2.5 rounded-xl gap-2 cursor-pointer h-10"
            >
              <Users className="h-4 w-4" />
              <span>تصدير</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/60 p-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث بالاسم، البريد، الجوال..."
                className="w-full h-10 ps-9 pe-3.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Table Data Box */}
      <Card className="border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-5">
          <GenericDataGrid
            rowData={filteredItems}
            columnDefs={columnDefs}
            loading={isLoading}
            height={520}
            onViewRow={(data) => {
              setEditingItem(data)
              setIsViewOnly(true)
              setIsFormOpen(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Add / Edit / View Modal */}
      <TeamFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingItem={editingItem}
        onSave={handleSave}
        loading={createMutation.isPending || updateMutation.isPending}
        isViewOnly={isViewOnly}
      />

      {/* Delete confirmation modal */}
      <ModalStatus
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        type="delete"
        title="تأكيد حذف حساب الموظف"
        description={`هل أنت متأكد من رغبتك في حذف حساب "${deletingItem?.name || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        agreeLabel="حذف"
        cancelLabel="إلغاء"
        onAgreeButtonClick={confirmDelete}
        onCancelButtonClick={() => setDeletingItem(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
