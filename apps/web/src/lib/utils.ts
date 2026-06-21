import type { TipoOperacion } from '@elite/types'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(price: number, moneda = 'BOB'): string {
  if (moneda === 'BOB') {
    return `Bs. ${price.toLocaleString('es-BO')}`
  }
  return `$us. ${price.toLocaleString('es-BO')}`
}

export function isNew(createdAt: string, days = 7): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= days
}

export function badgeConfig(tipo: TipoOperacion) {
  const configs = {
    VENTA: { label: 'Venta', className: 'bg-gold text-green-deep' },
    ALQUILER: { label: 'Alquiler', className: 'border border-gold text-gold bg-green-deep' },
    ANTICRETICO: { label: 'Anticretico', className: 'bg-white/10 backdrop-blur text-white border border-white/30' },
  }
  return configs[tipo]
}

export function whatsappUrl(number: string, message?: string): string {
  const clean = number.replace(/\D/g, '')
  const msg = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${msg}`
}
