import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageUp, RotateCcw, Settings } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Logo } from '@/components/shared/Logo'
import { ConfirmAction } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useResetLogo, useSiteSettings, useUploadLogo } from '../api/useSiteSettings'

const MAX_BYTES = 1024 * 1024
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useSiteSettings()
  const upload = useUploadLogo()
  const reset = useResetLogo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const onPick = (file?: File) => {
    setError(null)
    if (!file) return
    if (!ACCEPT.split(',').includes(file.type)) return setError(t('settings.badType'))
    if (file.size > MAX_BYTES) return setError(t('settings.tooBig'))
    upload.mutate(file)
  }

  const hasCustom = !!data?.logo

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} icon={Settings} />

      <Card className="p-6">
        <h2 className="text-base font-semibold">{t('settings.logo')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings.logoHint')}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex h-36 items-center justify-center rounded-xl border border-border bg-white p-4">
            {isLoading ? <span className="text-sm text-zinc-400">…</span> : <Logo size="lg" plain />}
          </div>
          {/* `dark` scopes Tailwind's dark variant so the default logo renders as it does in dark mode */}
          <div className="dark flex h-36 items-center justify-center rounded-xl border border-border bg-zinc-900 p-4">
            {isLoading ? <span className="text-sm text-zinc-500">…</span> : <Logo size="lg" />}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {hasCustom ? t('settings.usingCustom') : t('settings.usingDefault')}
        </p>

        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              onPick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <ImageUp className="h-4 w-4" />
            {upload.isPending ? t('settings.uploading') : t('settings.upload')}
          </Button>
          {hasCustom && (
            <Button variant="outline" onClick={() => setConfirmReset(true)} disabled={reset.isPending}>
              <RotateCcw className="h-4 w-4" />
              {t('settings.reset')}
            </Button>
          )}
        </div>
      </Card>

      <ConfirmAction
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('settings.resetTitle')}
        description={t('settings.resetText')}
        confirmLabel={t('settings.reset')}
        variant="warning"
        loading={reset.isPending}
        onConfirm={() => reset.mutate(undefined, { onSettled: () => setConfirmReset(false) })}
      />
    </div>
  )
}
