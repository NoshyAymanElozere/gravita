import * as React from 'react'
import {
  Activity,
  Anchor,
  Bike,
  Briefcase,
  Building2,
  Car,
  FileText,
  Heart,
  HeartPulse,
  Home,
  Laptop,
  Layers,
  LifeBuoy,
  Plane,
  Shield,
  ShieldCheck,
  Ship,
  Truck,
  Umbrella,
  Users,
} from 'lucide-react'
import { cn } from '@/utils/utils'

/** Icon keys the admin dashboard lets you pick for a category (plus a few aliases) */
const ICON_MAP: Record<string, React.ElementType> = {
  car: Car,
  vehicle: Car,
  ship: Ship,
  marine: Ship,
  yacht: Ship,
  plane: Plane,
  travel: Plane,
  heart: Heart,
  'heart-pulse': HeartPulse,
  health: HeartPulse,
  medical: HeartPulse,
  home: Home,
  property: Home,
  building: Building2,
  corporate: Building2,
  shield: Shield,
  'shield-check': ShieldCheck,
  umbrella: Umbrella,
  briefcase: Briefcase,
  business: Briefcase,
  laptop: Laptop,
  tech: Laptop,
  cyber: Laptop,
  anchor: Anchor,
  truck: Truck,
  cargo: Truck,
  bike: Bike,
  'file-text': FileText,
  users: Users,
  layers: Layers,
  activity: Activity,
  'life-buoy': LifeBuoy,
}

const isImageUrl = (s?: string | null) => !!s && /^(https?:\/\/|data:|\/)/.test(s) && !/^\/?[a-z-]+$/i.test(s)

/**
 * A category's `icon` is a key such as `car` or `shield-check`; `icon_url` may hold
 * either an uploaded image URL or that same key, so both are handled.
 */
export function CategoryIcon({
  icon,
  iconUrl,
  className,
}: {
  icon?: string | null
  iconUrl?: string | null
  className?: string
}) {
  const [imageFailed, setImageFailed] = React.useState(false)

  if (isImageUrl(iconUrl) && !imageFailed) {
    return <img src={iconUrl!} alt="" onError={() => setImageFailed(true)} className={cn('object-contain', className)} />
  }

  // Keys may arrive as `heart_pulse`, `Car`, or a URL ending in the key
  const raw = (icon || (isImageUrl(iconUrl) ? '' : iconUrl) || '').trim().toLowerCase().replace(/_/g, '-')
  const key = raw.split('/').pop()?.replace(/\.[a-z]+$/, '') ?? ''
  const Icon = ICON_MAP[key] ?? Shield
  return <Icon className={className} />
}
