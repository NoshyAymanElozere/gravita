import { ColDef } from 'ag-grid-community'

interface ProgramsColumnDefsProps {
  t: (key: string) => string
}

export function getProgramsColumnDefs({ t }: ProgramsColumnDefsProps): ColDef[] {
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
      headerName: t('price') || 'Price',
      field: 'price',
      width: 120,
      valueFormatter: (params) => `${Number(params.value || 0).toFixed(2)} USD`
    }
  ]
}
