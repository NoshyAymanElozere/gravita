import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/** Editable list of short strings (e.g. product benefits) */
export function StringListField({
  value,
  onChange,
  label,
  placeholder,
  dir,
  max = 12,
}: {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  placeholder?: string
  dir?: 'ltr' | 'rtl'
  max?: number
}) {
  const { t } = useTranslation()
  const items = value.length ? value : []
  return (
    <div className="flex flex-col gap-2" dir={dir}>
      {label && <span className="text-sm font-medium">{label}</span>}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
          <Input
            value={item}
            dir={dir}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label={t('common.remove')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...items, ''])}>
          <Plus className="h-3.5 w-3.5" />
          {t('common.addItem')}
        </Button>
      )}
    </div>
  )
}
