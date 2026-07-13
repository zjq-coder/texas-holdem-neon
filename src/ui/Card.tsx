import type { CSSProperties } from 'react'
import type { Card } from '../engine/types'
import styles from '../styles/card.module.css'

const RANK_LABEL: Record<Card['rank'], string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}

const SUIT_GLYPH: Record<Card['suit'], string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
}

export type CardEnterAnim = 'deal' | 'flip' | 'none'

export interface CardViewProps {
  card: Card | null
  faceDown?: boolean
  highlight?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Enter animation: deal-in (hole) or rotateY flip (community). Class-based for reduced-motion. */
  enter?: CardEnterAnim
  /** Stagger delay in ms for deal/flip sequences */
  delayMs?: number
}

export function CardView({
  card,
  faceDown = false,
  highlight = false,
  className = '',
  size = 'md',
  enter = 'none',
  delayMs = 0,
}: CardViewProps) {
  const sizeClass =
    size === 'sm'
      ? styles.sm
      : size === 'xl'
        ? styles.xl
        : size === 'lg'
          ? styles.lg
          : ''
  const enterClass =
    enter === 'deal' ? styles.dealIn : enter === 'flip' ? styles.flipIn : ''
  const rootClass = [
    styles.card,
    sizeClass,
    highlight ? styles.highlight : '',
    enterClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style: CSSProperties | undefined =
    delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined

  if (!card) {
    return (
      <div
        className={`${rootClass} ${styles.empty}`}
        aria-hidden
        data-card="empty"
      />
    )
  }

  if (faceDown) {
    return (
      <div
        className={rootClass}
        style={style}
        aria-label="牌背"
        data-card="back"
      >
        <div className={styles.back} />
      </div>
    )
  }

  const red = card.suit === 'h' || card.suit === 'd'
  const colorClass = red ? styles.red : styles.black
  const rank = RANK_LABEL[card.rank]
  const suit = SUIT_GLYPH[card.suit]

  return (
    <div
      className={rootClass}
      style={style}
      aria-label={`${rank}${suit}`}
      data-card={`${rank}${card.suit}`}
    >
      <div className={`${styles.face} ${colorClass}`}>
        <div className={styles.rankCorner}>
          <span>{rank}</span>
          <span className={styles.suitCorner}>{suit}</span>
        </div>
        <span className={styles.suitCenter}>{suit}</span>
      </div>
    </div>
  )
}
