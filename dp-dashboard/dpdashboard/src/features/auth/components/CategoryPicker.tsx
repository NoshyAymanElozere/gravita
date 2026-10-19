import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Check, RotateCcw } from 'lucide-react'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { cn } from '@/utils/utils'
import { useInsuranceCategories } from '../api/useAuth'

/** Multi-select of the insurance categories a company operates in — bound to `category_ids` */
export function CategoryPicker({ name = 'category_ids', label, hint }: { name?: string; label: string; hint?: string }) {
  const { t, i18n } = useTranslation()
  const { control, formState } = useFormContext()
  const { data: categories, isLoading, isError, refetch } = useInsuranceCategories(i18n.language)
  const error = formState.errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span id={`${name}-label`} className="text-[13px] font-bold text-[#1F2354]">
          {label}
          <i className="ms-1 not-italic text-[#d94b52]">*</i>
        </span>
        <Controller
          control={control}
          name={name}
          render={({ field }) =>
            (field.value as number[]).length > 0 ? (
              <span className="text-xs font-semibold text-[#5C66AF]">
                {t('auth.register.categoriesSelected', { count: (field.value as number[]).length })}
              </span>
            ) : (
              <></>
            )
          }
        />
      </div>

      {isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[58px] animate-pulse rounded-2xl bg-[#EEEFF8]" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#f3c6c8] bg-[#fdf2f2] px-4 py-3 text-xs font-semibold text-[#d94b52]">
          {t('auth.register.categoriesLoadError')}
          <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-1 font-bold hover:underline">
            <RotateCcw className="h-3.5 w-3.5" /> {t('auth.register.retry')}
          </button>
        </div>
      ) : (
        <Controller
          control={control}
          name={name}
          render={({ field }) => {
            const selected = field.value as number[]
            const toggle = (id: number) =>
              field.onChange(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id])
            return (
              <div role="group" aria-labelledby={`${name}-label`} className="grid gap-2.5 sm:grid-cols-2">
                {(categories ?? []).map((c) => {
                  const on = selected.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(c.id)}
                      onBlur={field.onBlur}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border bg-white p-2.5 text-start transition-all',
                        on
                          ? 'border-[#5C66AF] bg-[#F5F6FC] shadow-[0_0_0_3px_rgba(92,102,175,.11)]'
                          : 'border-[#D8DAEB] hover:border-[#5C66AF]/60',
                        error && !selected.length && 'border-[#d94b52]/60'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
                          on ? 'bg-[linear-gradient(145deg,#5C66AF,#1F2354)] text-white' : 'bg-[#EEEFF8] text-[#5C66AF]'
                        )}
                      >
                        <CategoryIcon icon={c.icon} iconUrl={c.icon_url} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-[#1F2354]">{c.name}</span>
                      <span
                        className={cn(
                          'grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
                          on ? 'border-[#5C66AF] bg-[#5C66AF] text-white' : 'border-[#D8DAEB]'
                        )}
                      >
                        {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          }}
        />
      )}

      {error ? (
        <p className="text-xs font-semibold text-[#d94b52]">{t(error)}</p>
      ) : (
        hint && <p className="text-xs text-[#5E658E]">{hint}</p>
      )}
    </div>
  )
}
