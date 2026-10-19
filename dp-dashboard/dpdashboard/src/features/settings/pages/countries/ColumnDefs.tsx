import { Button } from '@/components/ui/button'
import { StatusDropdown } from '@/components/shared/StatusDropdown'
import { ColDef } from 'ag-grid-community'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ColumnDefsProps {
    t: (key: string) => string
    toggleMutation: any
    setEditingItem: (item: any) => void
    setIsModalOpen: (open: boolean) => void
    setDeletingItem: (item: any) => void
    setIsViewOnly: (view: boolean) => void
}

export function getCountriesColumnDefs({
    t,
    toggleMutation,
    setEditingItem,
    setIsModalOpen,
    setDeletingItem,
    setIsViewOnly
}: ColumnDefsProps): ColDef[] {
    return [
        {
            headerName: t('arabicName') || 'Arabic Name',
            valueGetter: (params) => {
                return params.data?.translations?.find((trans: any) => trans.language_id === 2)?.name || ''
            },
           filter:false,
            flex: 1
        },
        {
            headerName: t('englishName') || 'English Name',
            valueGetter: (params) => {
                return params.data?.translations?.find((trans: any) => trans.language_id === 1)?.name || params.data?.name || ''
            },
           filter:false,
            flex: 1
        },
        {
            headerName: t('code') || 'Code',
            field: 'code',
           filter:false,
            width: 100
        },
        {
            headerName: t('phoneCode') || 'Phone Code',
            field: 'phone_code',
           filter:false,
            width: 120
        },
        {
            headerName: t('status') || 'Status',
            field: 'is_active',
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: (params: any) => (params.value ? t('active') || 'Active' : t('inactive') || 'Inactive')
            },
            width: 150,
            cellRenderer: (params: any) => {
                const item = params.data
                if (!item) return null
                return (
                    <StatusDropdown
                        value={item.is_active}
                        onChange={() => toggleMutation.mutateAsync(item.id)}
                    />
                )
            }
        },
        {
            headerName: t('flagImage') || 'Flag Image',
            field: 'image_url',
            filter: false,
            width: 130,
            cellRenderer: (params: any) => {
                const item = params.data
                const imageUrl = item?.image_url || item?.image?.file_path
                if (!imageUrl) return <span className="text-gray-300 text-xs">-</span>
                return (
                    <img
                        src={imageUrl}
                        alt="flag"
                        className="h-10 w-16 object-cover rounded border border-gray-100 mt-1"
                    />
                )
            }
        },
        {
            headerName: t('actions') || 'Actions',
            filter: false,
            width: 150,
            cellClass: 'flex items-center justify-start h-full',
            cellRenderer: (params: any) => {
                const item = params.data
                if (!item) return null
                return (
                    <div className="flex items-center justify-start gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                                setEditingItem(item)
                                setIsViewOnly(true)
                                setIsModalOpen(true)
                            }}
                        >
                            <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                                setEditingItem(item)
                                setIsViewOnly(false)
                                setIsModalOpen(true)
                            }}
                        >
                            <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingItem(item)}
                        >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                    </div>
                )
            }
        }
    ]
}
