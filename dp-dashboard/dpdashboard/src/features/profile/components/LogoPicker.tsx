import * as React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Building2, Camera, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/utils'
import { LOGO_TYPES } from '../lib/schemas'

/** Square logo with a camera button; holds a pending `File` until the form is saved. */
export function LogoPicker({ name, currentUrl, alt }: { name: string; currentUrl?: string | null; alt: string }) {
  const { t } = useTranslation()
  const { control, trigger } = useFormContext()
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <LogoPreview
          file={value as File | null}
          currentUrl={currentUrl}
          alt={alt}
          error={error?.message ? t(error.message) : undefined}
          onPick={() => inputRef.current?.click()}
          onRevert={() => {
            onChange(null)
            trigger(name)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={LOGO_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onChange(file)
              trigger(name) // surface type/size errors immediately, not only on save
            }}
          />
        </LogoPreview>
      )}
    />
  )
}

function LogoPreview({
  file,
  currentUrl,
  alt,
  error,
  onPick,
  onRevert,
  children,
}: {
  file: File | null
  currentUrl?: string | null
  alt: string
  error?: string
  onPick: () => void
  onRevert: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [broken, setBroken] = React.useState(false)

  React.useEffect(() => {
    if (!file) return setPreviewUrl(null)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  React.useEffect(() => setBroken(false), [currentUrl])

  const src = previewUrl ?? (broken ? null : currentUrl)

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="relative">
        <button
          type="button"
          onClick={onPick}
          className={cn(
            'group relative grid h-28 w-28 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[0_12px_30px_rgba(31,35,84,.14)] dark:border-zinc-900 dark:bg-zinc-900',
            error && 'ring-2 ring-rose-500'
          )}
          aria-label={t('profile.logo.change')}
        >
          {src ? (
            <img src={src} alt={alt} onError={() => setBroken(true)} className="h-full w-full object-contain p-2" />
          ) : (
            <Building2 className="h-10 w-10 text-[#9AA0C3]" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-[#1F2354]/55 text-white opacity-0 transition group-hover:opacity-100">
            <Camera className="h-6 w-6" />
          </span>
        </button>
        <span className="pointer-events-none absolute -bottom-1 -end-1 grid h-9 w-9 place-items-center rounded-full border-[3px] border-white bg-[linear-gradient(145deg,#5C66AF,#1F2354)] text-white shadow dark:border-zinc-900">
          <Camera className="h-4 w-4" />
        </span>
      </div>
      {file && (
        <button type="button" onClick={onRevert} className="inline-flex items-center gap-1 text-xs font-semibold text-[#5E658E] hover:text-[#1F2354]">
          <RotateCcw className="h-3 w-3" />
          {t('profile.logo.revert')}
        </button>
      )}
      {error && <p className="max-w-[12rem] text-center text-xs font-semibold text-rose-500 sm:text-start">{error}</p>}
      {children}
    </div>
  )
}
