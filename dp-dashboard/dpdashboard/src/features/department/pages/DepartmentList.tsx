import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { Plus, FolderKanban, Search, RefreshCw, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog'
import { BaseInputField } from '@/components/shared/base-input-field'
import { useForm, FormProvider } from 'react-hook-form'
import {
    useDepartmentList,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment
} from '../api/useDepartment'
import type { Department } from '../api/useDepartment'
import { getDepartmentColumnDefs } from '../components/ColumnDefs'

interface DepartmentFormData {
    name_ar: string
    name_en: string
}

export default function DepartmentList() {
    const { t, i18n } = useTranslation()
    const [search, setSearch] = useState('')
    const label = t('departments') || 'Departments'
    const isRtl = i18n.language === 'ar'

    // dialog states
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Department | null>(null)
    const [deletingItem, setDeletingItem] = useState<Department | null>(null)

    const { data: items = [], isLoading, refetch, isRefetching } = useDepartmentList()
    const createMutation = useCreateDepartment()
    const updateMutation = useUpdateDepartment()
    const deleteMutation = useDeleteDepartment()

    const methods = useForm<DepartmentFormData>({
        defaultValues: {
            name_ar: '',
            name_en: ''
        }
    })

    const { reset, handleSubmit } = methods

    // Reset when editing item state changes
    useEffect(() => {
        if (editingItem) {
            reset({
                name_ar: editingItem.name_ar,
                name_en: editingItem.name_en
            })
        } else {
            reset({
                name_ar: '',
                name_en: ''
            })
        }
    }, [editingItem, reset])

    // Client-side search filtering
    const filteredItems = useMemo(() => {
        if (!search) return items
        const query = search.toLowerCase()
        return items.filter(
            (item) =>
                item.name_ar?.toLowerCase().includes(query) ||
                item.name_en?.toLowerCase().includes(query) ||
                item.slug?.toLowerCase().includes(query)
        )
    }, [items, search])

    const handleAddClick = () => {
        setEditingItem(null)
        setIsFormOpen(true)
    }

    const handleEditClick = (item: Department) => {
        setEditingItem(item)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (item: Department) => {
        setDeletingItem(item)
    }

    const onSubmit = (data: DepartmentFormData) => {
        if (editingItem && editingItem.slug) {
            updateMutation.mutate({
                slug: editingItem.slug,
                deptData: data
            }, {
                onSuccess: () => {
                    setIsFormOpen(false)
                    setEditingItem(null)
                }
            })
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    setIsFormOpen(false)
                }
            })
        }
    }

    const columnDefs = getDepartmentColumnDefs({
        t,
        onEditClick: handleEditClick,
        onDeleteClick: handleDeleteClick
    })

    return (
        <div className="space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* HERO MODULE BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-primary-gradient text-white p-6 md:p-8 shadow-md">
                {/* Decorative glowing backdrops */}
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl transform translate-x-10 -translate-y-10" />
                <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-primary/20 blur-xl" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs select-none">
                            <Layers className="h-3.5 w-3.5 text-blue-200" />
                            <span>{isRtl ? 'إدارة تصنيفات الموقع' : 'Website Taxonomy Manager'}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {isRtl ? 'الأقسام والإدارات' : 'Departments Directory'}
                        </h1>
                        <p className="text-gray-200 text-sm max-w-xl">
                            {isRtl
                                ? 'أنشئ وهيكل تصنيفات المقالات بشكل يلائم محركات البحث وتصفح المستخدمين. سيتم توليد الروابط البديلة (Slugs) ذاتياً.'
                                : 'Configure and structure blog categories for optimal SEO routing and navigation. Slugs are automatically generated.'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => refetch()}
                            disabled={isLoading || isRefetching}
                            className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-2xl h-12 w-12"
                        >
                            <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            onClick={handleAddClick}
                            className="bg-white text-primary hover:bg-gray-100 font-bold px-6 rounded-2xl h-12 shadow-sm text-sm"
                        >
                            <Plus className="mr-2 h-5 w-5" /> {isRtl ? 'إضافة قسم جديد' : 'Create Department'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/40 shadow-xs rounded-2xl p-5 flex items-center gap-4 bg-card/60 backdrop-blur-xs">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
                        <FolderKanban className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
                            {isRtl ? 'إجمالي الأقسام' : 'Total Departments'}
                        </span>
                        <span className="text-2xl font-black text-foreground">{items.length}</span>
                    </div>
                </Card>

                <Card className="border-border/40 shadow-xs rounded-2xl p-5 flex items-center gap-4 bg-card/60 backdrop-blur-xs">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Search className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
                            {isRtl ? 'الأقسام المفلترة' : 'Filtered Matches'}
                        </span>
                        <span className="text-2xl font-black text-foreground">{filteredItems.length}</span>
                    </div>
                </Card>

                <Card className="border-border/40 shadow-xs rounded-2xl p-5 flex items-center gap-4 bg-card/60 backdrop-blur-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
                            {isRtl ? 'الحالة العامة' : 'Operational Status'}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                            {isRtl ? 'مستقر ومتصل' : 'Stable & Synced'}
                        </span>
                    </div>
                </Card>
            </div>

            {/* DATA GRID & FILTER PANEL */}
            <Card className="border-border/40 shadow-sm rounded-3xl overflow-hidden bg-card">
                <CardContent className="p-6 space-y-4">
                    <div className="flex max-w-sm">
                        <SearchInput
                            placeholder={`${t('search') || 'Search'} ${label}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <GenericDataGrid
                        rowData={filteredItems}
                        columnDefs={columnDefs}
                        rowHeight={60}
                        headerHeight={50}
                        loading={isLoading}
                        isServerSide={false}
                    />
                </CardContent>
            </Card>

            {/* Addition & Editing Modal Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => {
                setIsFormOpen(open)
                if (!open) setEditingItem(null)
            }}>
                <DialogContent size="sm" className="rounded-3xl border border-border/80 shadow-2xl backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            {editingItem
                                ? (isRtl ? 'تعديل بيانات القسم' : 'Modify Department')
                                : (isRtl ? 'تأسيس قسم جديد' : 'New Department Directory')
                            }
                        </DialogTitle>
                    </DialogHeader>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-3">
                            <BaseInputField
                                name="name_ar"
                                label={t('arabicName') || 'Arabic Name'}
                                required
                                placeholder="مثال: الذكاء الاصطناعي"
                                className="h-11 rounded-xl"
                            />
                            <BaseInputField
                                name="name_en"
                                label={t('englishName') || 'English Name'}
                                required
                                placeholder="e.g. AI & Machine Learning"
                                className="h-11 rounded-xl"
                            />
                            <DialogFooter className="pt-3 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsFormOpen(false)
                                        setEditingItem(null)
                                    }}
                                    className="rounded-xl h-11"
                                >
                                    {t('cancel') || 'Cancel'}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={createMutation.isPending || updateMutation.isPending}
                                    className="bg-main hover:bg-main/90 text-white rounded-xl h-11 px-6 font-bold"
                                >
                                    {t('save') || 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Deletion Confirmation Modal */}
            <ModalStatus
                open={!!deletingItem}
                onOpenChange={(v) => !v && setDeletingItem(null)}
                title={`${t('delete') || 'Delete'} ${t('department') || 'Department'}`}
                description={t('deleteConfirmation') || "Are you sure you want to delete this department? This action cannot be undone."}
                agreeLabel={t('delete') || 'Delete'}
                cancelLabel={t('cancel') || 'Cancel'}
                onAgreeButtonClick={() => {
                    if (deletingItem && deletingItem.slug) {
                        deleteMutation.mutate(deletingItem.slug, {
                            onSuccess: () => setDeletingItem(null)
                        })
                    }
                }}
                onCancelButtonClick={() => setDeletingItem(null)}
                loading={deleteMutation.isPending}
                type="delete"
            />
        </div>
    )
}
