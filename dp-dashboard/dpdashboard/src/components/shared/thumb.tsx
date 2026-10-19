import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageOff } from 'lucide-react'
import { cn } from '@/utils/utils'
import { resolveImageUrl } from '@/utils/media'

/** Small rounded image with a graceful fallback */
export function Thumb({ src, alt = '', className }: { src?: string | null; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = resolveImageUrl(src)
  return (
    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40', className)}>
      {url && !failed ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <ImageOff className="h-4 w-4 text-muted-foreground/60" />
      )}
    </span>
  )
}

export function RatingStars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 'text-xs' : 'text-base'
  return (
    <span className={cn('inline-flex items-center gap-0.5 leading-none', px)} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  )
}

/** Bilingual name: the current UI language first, the other one underneath */
export function BiName({ en, ar, className }: { en?: string; ar?: string; className?: string }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [primary, secondary] = isAr ? [ar || en, en] : [en || ar, ar]
  return (
    <div className={cn('min-w-0 leading-tight', className)}>
      <p className="truncate font-semibold" dir={isAr ? 'rtl' : 'ltr'}>
        {primary}
      </p>
      {secondary && secondary !== primary && (
        <p className="truncate text-xs text-muted-foreground" dir={isAr ? 'ltr' : 'rtl'}>
          {secondary}
        </p>
      )}
    </div>
  )
}
