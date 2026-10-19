import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GenericDataGrid } from '@/components/shared/GenericDataGrid'
import { SearchInput } from '@/components/ui/input'
import ModalStatus from '@/components/shared/modal-status'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBlogList, useDeleteBlog } from '../api/useBlog'
import type { BlogPost } from '../api/useBlog'
import { getBlogColumnDefs } from '../components/ColumnDefs'

export default function BlogList() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const label = t('blogs') || 'Blogs'

    const [deletingItem, setDeletingItem] = useState<BlogPost | null>(null)

    const { data: items = [], isLoading } = useBlogList()
    const deleteMutation = useDeleteBlog()

    // Filter items client-side based on search term
    const filteredItems = useMemo(() => {
        if (!search) return items
        const query = search.toLowerCase()
        return items.filter(
            (item) =>
                item.title?.toLowerCase().includes(query) ||
                item.slug?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                item.author?.name?.toLowerCase().includes(query)
        )
    }, [items, search])

    const handleEditClick = (item: BlogPost) => {
        navigate(`/blogs/edit/${item.slug}`)
    }

    const handleDeleteClick = (item: BlogPost) => {
        setDeletingItem(item)
    }

    const columnDefs = getBlogColumnDefs({
        t,
        onEditClick: handleEditClick,
        onDeleteClick: handleDeleteClick
    })

    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 px-6 py-5">
                <CardTitle className="text-lg font-bold text-foreground">{label}</CardTitle>
                <Button onClick={() => navigate('/blogs/new')} className="h-9 px-4 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> {t('add') || 'Add New'}
                </Button>
            </CardHeader>

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
                    onViewRow={(item) => navigate(`/blogs/view/${item.slug}`)}
                />
            </CardContent>

            <ModalStatus
                open={!!deletingItem}
                onOpenChange={(v) => !v && setDeletingItem(null)}
                title={`${t('delete') || 'Delete'} ${t('blog') || 'Blog Post'}`}
                description={t('deleteConfirmation') || "Are you sure you want to delete this blog post? This action cannot be undone."}
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
        </Card>
    )
}
