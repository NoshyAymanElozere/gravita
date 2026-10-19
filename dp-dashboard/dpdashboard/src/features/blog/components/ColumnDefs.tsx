import { Button } from '@/components/ui/button'
import type { ColDef } from 'ag-grid-community'
import { Pencil, Trash2 } from 'lucide-react'
import type { BlogPost } from '../api/useBlog'

interface ColumnDefsProps {
    t: (key: string) => string
    onEditClick: (item: BlogPost) => void
    onDeleteClick: (item: BlogPost) => void
}

export function getBlogColumnDefs({
    t,
    onEditClick,
    onDeleteClick
}: ColumnDefsProps): ColDef[] {
    return [
        {
            headerName: t('coverImage') || 'Cover Image',
            field: 'coverImage',
            filter: false,
            width: 120,
            cellRenderer: (params: any) => {
                const item = params.data as BlogPost
                if (!item?.coverImage) return <span className="text-gray-300 text-xs">-</span>
                return (
                    <img
                        src={item.coverImage}
                        alt="cover"
                        className="h-10 w-16 object-cover rounded border border-gray-100 mt-1"
                    />
                )
            }
        },
        {
            headerName: t('title') || 'Title',
            field: 'title',
            filter: false,
            flex: 2,
            cellRenderer: (params: any) => {
                const item = params.data as BlogPost
                if (!item) return null
                return (
                    <div className="flex flex-col justify-center h-full py-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.title}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">/{item.slug}</span>
                    </div>
                )
            }
        },
        {
            headerName: t('category') || 'Category',
            field: 'category',
            filter: false,
            width: 150
        },
        {
            headerName: t('author') || 'Author',
            field: 'author.name',
            filter: false,
            width: 180,
            cellRenderer: (params: any) => {
                const item = params.data as BlogPost
                if (!item?.author) return <span className="text-gray-300 text-xs">-</span>
                return (
                    <div className="flex items-center gap-2 mt-1">
                        {item.author.avatarUrl && (
                            <img
                                src={item.author.avatarUrl}
                                alt="author avatar"
                                className="h-7 w-7 rounded-full object-cover border border-gray-100"
                            />
                        )}
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                            {item.author.name}
                        </span>
                    </div>
                )
            }
        },
        {
            headerName: t('readTime') || 'Read Time',
            field: 'readTime',
            filter: false,
            width: 120
        },
        {
            headerName: t('publishedAt') || 'Published At',
            field: 'publishedAt',
            filter: false,
            width: 140,
            valueFormatter: (params: any) => {
                if (!params.value) return ''
                const date = new Date(params.value)
                return date.toLocaleDateString()
            }
        },
        {
            headerName: t('actions') || 'Actions',
            filter: false,
            sortable: false,
            width: 120,
            cellClass: 'flex items-center justify-start h-full',
            cellRenderer: (params: any) => {
                const item = params.data as BlogPost
                if (!item) return null
                return (
                    <div className="flex items-center justify-start gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEditClick(item)}
                        >
                            <Pencil className="h-4 w-4 text-gray-500 hover:text-primary" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDeleteClick(item)}
                        >
                            <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-700" />
                        </Button>
                    </div>
                )
            }
        }
    ]
}
