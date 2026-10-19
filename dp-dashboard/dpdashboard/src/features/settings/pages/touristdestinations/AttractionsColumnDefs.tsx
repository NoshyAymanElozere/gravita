import { ColDef } from 'ag-grid-community'

interface AttractionsColumnDefsProps {
  t: (key: string) => string
}

export function getAttractionsColumnDefs({ t }: AttractionsColumnDefsProps): ColDef[] {
  return [
    {
      filter: false,
      headerName: t('arabicName') || 'Arabic Name',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 2)?.name || ''
      },
      flex: 1
    },
    {
      filter: false,
      headerName: t('englishName') || 'English Name',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 1)?.name || params.data?.name || ''
      },
      flex: 1
    },
    {
      filter: false,
      headerName: t('arabicDescription') || 'Arabic Description',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 2)?.description || ''
      },
      flex: 1.5
    },
    {
      filter: false,
      headerName: t('englishDescription') || 'English Description',
      valueGetter: (params) => {
        return params.data?.translations?.find((trans: any) => trans.language_id === 1)?.description || params.data?.description || ''
      },
      flex: 1.5
    },
    // {
    //   filter: false,
    //   headerName: t('status') || 'Status',
    //   width: 120,
    //   cellRenderer: (params: any) => {
    //     const active = params.data?.is_active
    //     return (
    //       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${active
    //           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    //           : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    //         }`}>
    //         <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    //         {active ? t('active') || 'Active' : t('inactive') || 'Inactive'}
    //       </span>
    //     )
    //   }
    // }
  ]
}
