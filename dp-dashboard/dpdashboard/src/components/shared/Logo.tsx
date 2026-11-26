import { cn } from '@/utils/utils'
import { useSiteSettings } from '@/features/settings/api/useSiteSettings'

interface LogoProps {
  collapsed?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Disable the dark-mode inversion of the default logo (used on fixed-colour previews) */
  plain?: boolean
}

// The default logo (pharmaa/src/assets/images/Logo.png, 1920×1080) has a lot of padding.
// We crop it with CSS instead of shipping a second asset:
//   full mark  → x 660..1260, y 325..765   (600×440)
//   icon only  → x 870..1050, y 320..500   (180×180)
const SRC = '/logo-aura.png'
const FULL = { x: 660, y: 325, w: 600, h: 440 }
const ICON = { x: 870, y: 320, w: 180, h: 180 }

const widths = { sm: 76, md: 104, lg: 150 }
const iconWidths = { sm: 30, md: 36, lg: 44 }
const heights = { sm: 48, md: 64, lg: 96 }

function Cropped({ region, width, alt, plain }: { region: typeof FULL; width: number; alt: string; plain?: boolean }) {
  const scale = width / region.w
  return (
    <span
      className="relative block shrink-0 overflow-hidden"
      style={{ width, height: Math.round(region.h * scale) }}
    >
      <img
        src={SRC}
        alt={alt}
        draggable={false}
        className={cn('absolute max-w-none select-none', !plain && 'dark:invert dark:hue-rotate-180')}
        style={{ width: 1920 * scale, height: 1080 * scale, left: -region.x * scale, top: -region.y * scale }}
      />
    </span>
  )
}

export function Logo({ collapsed = false, className = '', size = 'md', plain = false }: LogoProps) {
  const { data, isLoading } = useSiteSettings()
  const custom = data?.logo

  // Avoid flashing the default logo while the custom one loads
  if (isLoading) {
    return <div className={cn('inline-block', className)} style={{ height: collapsed ? iconWidths[size] : heights[size] }} />
  }

  return (
    <div className={cn('inline-flex items-center select-none', className)} dir="ltr">
      {custom ? (
        <img
          src={custom}
          alt="Logo"
          draggable={false}
          className="block object-contain select-none"
          style={
            collapsed
              ? { width: iconWidths[size], height: iconWidths[size] }
              : { maxWidth: widths[size] * 1.6, maxHeight: heights[size] }
          }
        />
      ) : collapsed ? (
        <Cropped region={ICON} width={iconWidths[size]} alt="AURA Laboratories" plain={plain} />
      ) : (
        <Cropped region={FULL} width={widths[size]} alt="AURA Laboratories" plain={plain} />
      )}
    </div>
  )
}
