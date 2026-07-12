import { useEffect, useRef, useState } from 'react'
import styles from '../styles/table.module.css'

export interface ChipStackProps {
  amount: number
  className?: string
}

/** Compact neon chip amount label for street bets / pot fragments. */
export function ChipStack({ amount, className = '' }: ChipStackProps) {
  const [fly, setFly] = useState(false)
  const prev = useRef(0)

  useEffect(() => {
    if (amount > prev.current && amount > 0) {
      setFly(true)
      const t = window.setTimeout(() => setFly(false), 380)
      prev.current = amount
      return () => window.clearTimeout(t)
    }
    prev.current = amount
  }, [amount])

  if (amount <= 0) {
    return <span className={className} aria-hidden />
  }

  return (
    <span
      className={`${styles.badge} ${fly ? 'chipFly' : ''} ${className}`.trim()}
      title={`${amount}`}
      aria-label={`筹码 ${amount}`}
    >
      ◆ {amount.toLocaleString('zh-CN')}
    </span>
  )
}
