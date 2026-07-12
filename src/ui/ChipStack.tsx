import styles from '../styles/table.module.css'

export interface ChipStackProps {
  amount: number
  className?: string
}

/** Compact neon chip amount label for street bets / pot fragments. */
export function ChipStack({ amount, className = '' }: ChipStackProps) {
  if (amount <= 0) {
    return <span className={className} aria-hidden />
  }

  return (
    <span
      className={`${styles.badge} ${className}`.trim()}
      title={`${amount}`}
      aria-label={`筹码 ${amount}`}
    >
      ◆ {amount.toLocaleString('zh-CN')}
    </span>
  )
}
