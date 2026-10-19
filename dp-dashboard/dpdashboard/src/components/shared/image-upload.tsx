import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UploadCloud, X, ImagePlus } from 'lucide-react'
import { cn } from '@/utils/utils'
import { resolveImageUrl } from '@/utils/media'

/** A form image value: a newly picked File, an existing API path/URL, or nothing */
export type ImageValue = File | string | null

const MAX_BYTES = 5 * 1024 * 1024 // backend multer limit
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'

function usePreview(value: ImageValue) {
  // Created inside the effect so StrictMode's mount/unmount/mount cycle never leaves a revoked URL
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!(value instanceof File)) {
      setObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(value)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value])
  if (value instanceof File) return objectUrl ?? undefined
  return typeof value === 'string' ? resolveImageUrl(value) : undefined
}

function validateFile(file: File): string | null {
  if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) return 'common.imageTypeError'
  if (file.size > MAX_BYTES) return 'common.imageSizeError'
  return null
}

interface ImageUploadProps {
  value: ImageValue
  onChange: (value: ImageValue) => void
  label?: string
  disabled?: boolean
  className?: string
  aspectRatio?: string // e.g. "aspect-square", "h-40 w-full"
  error?: string
}

/** Single image picker with preview — controlled (use with react-hook-form Controller) */
export function ImageUpload({ value, onChange, label, disabled, className, aspectRatio = 'aspect-square w-full', error }: ImageUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = usePreview(value)
  const [localError, setLocalError] = React.useState<string | null>(null)

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validateFile(file)
    setLocalError(err)
    if (!err) onChange(file)
  }

  const shownError = localError ? t(localError) : error ? t(error) : null

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        className={cn(
          'group relative flex items-center justify-center overflow-hidden rounded-2xl transition-all',
          aspectRatio,
          disabled ? 'cursor-default border border-border bg-muted/40' : 'cursor-pointer border-2 border-dashed border-border bg-muted/30 hover:border-brand-sage hover:bg-accent/50',
          shownError && 'border-destructive'
        )}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={pick} onClick={(e) => e.stopPropagation()} className="hidden" disabled={disabled} />
        {preview ? (
          <>
            <img src={preview} alt="" className="h-full w-full object-cover" />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{t('common.change')}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(null)
                  }}
                  className="rounded-full bg-white/20 p-1.5 text-white backdrop-blur hover:bg-white/40"
                  aria-label={t('common.remove')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center p-4 text-center">
            <span className="mb-2 rounded-xl border border-border bg-card p-2.5 text-muted-foreground shadow-xs">
              <UploadCloud className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold">{t('common.uploadImage')}</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">{t('common.imageHint')}</span>
          </div>
        )}
      </div>
      {shownError && <p className="text-xs text-destructive">{shownError}</p>}
    </div>
  )
}

function GalleryTile({ value, onRemove, disabled }: { value: File | string; onRemove: () => void; disabled?: boolean }) {
  const { t } = useTranslation()
  const preview = usePreview(value)
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/30">
      {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
      {value instanceof File && (
        <span className="absolute start-1.5 top-1.5 rounded-md bg-brand-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-cream">
          {t('common.new')}
        </span>
      )}
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute end-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
          aria-label={t('common.remove')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

/** Multiple images (existing paths + new files) */
export function GalleryUpload({
  value,
  onChange,
  max = 6,
  disabled,
  label,
  hint,
}: {
  value: Array<File | string>
  onChange: (value: Array<File | string>) => void
  max?: number
  disabled?: boolean
  label?: string
  hint?: string
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const newCount = value.filter((v) => v instanceof File).length

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    const valid: File[] = []
    for (const f of files) {
      const err = validateFile(f)
      if (err) {
        setError(err)
        continue
      }
      valid.push(f)
    }
    if (valid.length) setError(null)
    // The API accepts at most `max` uploaded files per request
    onChange([...value, ...valid.slice(0, Math.max(0, max - newCount))])
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((v, i) => (
          <GalleryTile
            key={typeof v === 'string' ? v : `${v.name}-${i}`}
            value={v}
            disabled={disabled}
            onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
          />
        ))}
        {!disabled && newCount < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-brand-sage hover:bg-accent/50 hover:text-foreground"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{t('common.addImages')}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} multiple onChange={pick} className="hidden" />
      {error ? <p className="text-xs text-destructive">{t(error)}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
