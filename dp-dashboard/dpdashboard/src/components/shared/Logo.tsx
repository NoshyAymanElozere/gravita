import { cn } from '@/utils/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// The storefront logo (pharmaa/src/assets/images/Logo.png, 1920×1080) has a lot of padding.
// We crop it with CSS instead of shipping a second asset:
//   full mark  → x 660..1260, y 325..765   (600×440)
//   icon only  → x 870..1050, y 320..500   (180×180)
const SRC = '/logo-aura.png'
const FULL = { x: 660, y: 325, w: 600, h: 440 }
const ICON = { x: 870, y: 320, w: 180, h: 180 }

const widths = { sm: 76, md: 104, lg: 150 }
const iconWidths = { sm: 30, md: 36, lg: 44 }

function Cropped({ region, width, alt }: { region: typeof FULL; width: number; alt: string }) {
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
        className="absolute max-w-none select-none dark:invert dark:hue-rotate-180"
        style={{ width: 1920 * scale, height: 1080 * scale, left: -region.x * scale, top: -region.y * scale }}
      />
    </span>
  )
}

export function Logo({ collapsed = false, className = '', size = 'md' }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center select-none', className)} dir="ltr">
      {collapsed ? (
        <Cropped region={ICON} width={iconWidths[size]} alt="AURA Laboratories" />
      ) : (
        <Cropped region={FULL} width={widths[size]} alt="AURA Laboratories" />
      )}
    </div>
  )
}
