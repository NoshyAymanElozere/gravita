import React from 'react'
import { Button } from '@/components/ui/button'
import type { ColDef } from 'ag-grid-community'
import { Pencil, Trash2 } from 'lucide-react'
import type { Department } from '../api/useDepartment'

interface ColumnDefsProps {
    t: (key: string) => string
    onEditClick: (item: Department) => void
    onDeleteClick: (item: Department) => void
}

export function getDepartmentColumnDefs({
    t,
    onEditClick,
    onDeleteClick
}: ColumnDefsProps): ColDef[] {
    return [
        {
            headerName: t('arabicName') || 'Arabic Name',
            field: 'name_ar',
            filter: false,
            flex: 1,
            cellClass: 'font-semibold text-right'
        },
        {
            headerName: t('englishName') || 'English Name',
            field: 'name_en',
            filter: false,
            flex: 1,
            cellClass: 'font-semibold'
        },
        {
            headerName: t('slugLabel') || 'Slug / URL Path',
            field: 'slug',
            filter: false,
            width: 180,
            cellRenderer: (params: any) => {
                const item = params.data as Department
                if (!item) return null
                return (
                    <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                        /{item.slug}
                    </code>
                )
            }
        },
        {
            headerName: t('actions') || 'Actions',
            filter: false,
            width: 120,
            cellClass: 'flex items-center justify-start h-full',
            cellRenderer: (params: any) => {
                const item = params.data as Department
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
