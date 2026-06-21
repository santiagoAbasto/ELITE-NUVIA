import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

interface AnimatedHeadingProps {
  lines: string[]
  className?: string
  style?: CSSProperties
  initialDelay?: number
  charDelay?: number
}

export function AnimatedHeading({ lines, className, style, initialDelay = 200, charDelay = 30 }: AnimatedHeadingProps) {
  const [visible, setVisible] = useState<boolean[][]>(
    lines.map(line => new Array(line.length).fill(false))
  )

  useEffect(() => {
    let totalDelay = initialDelay
    const timeouts: ReturnType<typeof setTimeout>[] = []

    lines.forEach((line, li) => {
      line.split('').forEach((_, ci) => {
        const delay = totalDelay + ci * charDelay
        const t = setTimeout(() => {
          setVisible(prev => {
            const next = prev.map(row => [...row])
            next[li][ci] = true
            return next
          })
        }, delay)
        timeouts.push(t)
      })
      totalDelay += line.length * charDelay
    })

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <h1 className={className} style={style}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split('').map((char, ci) => (
            <span
              key={ci}
              style={{
                display: 'inline-block',
                opacity: visible[li]?.[ci] ? 1 : 0,
                transform: visible[li]?.[ci] ? 'translateX(0)' : 'translateX(-18px)',
                transition: 'opacity 500ms ease, transform 500ms ease',
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
