interface SectionEyebrowProps { label: string; center?: boolean }

export function SectionEyebrow({ label, center }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-3 mb-3 ${center ? 'justify-center' : ''}`}>
      {!center && <div className="w-6 h-px bg-gold" />}
      <span className="text-gold font-semibold text-[11px] tracking-[3px] uppercase">{label}</span>
    </div>
  )
}
