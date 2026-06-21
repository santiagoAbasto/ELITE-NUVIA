interface LogoSVGProps {
  variant?: 'dark' | 'light'
  size?: number
  showText?: boolean
}

export function LogoSVG({ variant = 'dark', size = 40, showText = true }: LogoSVGProps) {
  const gold = '#C9A84C'
  const green = variant === 'dark' ? '#0D3B27' : '#fff'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke={gold} strokeWidth="1.5" />
        <circle cx="32" cy="32" r="24" stroke={gold} strokeWidth="0.8" opacity="0.5" />
        <path d="M10 32 Q16 22 22 32 Q16 42 10 32Z" stroke={gold} strokeWidth="1.2" fill="none" />
        <path d="M54 32 Q48 22 42 32 Q48 42 54 32Z" stroke={gold} strokeWidth="1.2" fill="none" />
        <circle cx="32" cy="18" r="6.5" stroke={green} strokeWidth="1.8" fill="none" />
        <circle cx="32" cy="18" r="2.5" fill={gold} />
        <rect x="30.5" y="23" width="3" height="16" rx="1.5" fill={green} />
        <rect x="33.5" y="29" width="4.5" height="2.5" rx="1" fill={green} />
        <rect x="33.5" y="33.5" width="3.5" height="2.5" rx="1" fill={green} />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: variant === 'dark' ? '#fff' : '#0A2416', letterSpacing: '4px' }}>
            ELITE
          </span>
          <span style={{ fontSize: '12px', fontStyle: 'italic', color: gold, fontFamily: "'Playfair Display', serif" }}>
            Nuvia
          </span>
        </div>
      )}
    </div>
  )
}
