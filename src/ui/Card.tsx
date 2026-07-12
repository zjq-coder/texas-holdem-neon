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

export interface CardViewProps {
  card: Card | null
  faceDown?: boolean
  highlight?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CardView({
  card,
  faceDown = false,
  highlight = false,
  className = '',
  size = 'md',
}: CardViewProps) {
  const sizeClass =
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : ''
  const rootClass = [
    styles.card,
    sizeClass,
    highlight ? styles.highlight : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

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
