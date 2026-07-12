export type Suit = 's' | 'h' | 'd' | 'c'

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export interface Card {
  rank: Rank
  suit: Suit
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handOver'

export type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn'

export interface PlayerAction {
  type: PlayerActionType
  /** raise: 本街总投入目标（含已投入）；allIn 可省略 */
  amount?: number
}

export interface Seat {
  id: string
  name: string
  isHero: boolean
  isAI: boolean
  stack: number
  holeCards: Card[] | null
  betThisStreet: number
  totalBetThisHand: number
  folded: boolean
  allIn: boolean
  sittingOut: boolean
}

export interface Pot {
  amount: number
  eligibleSeatIds: string[]
}

export interface WinnerInfo {
  seatId: string
  amount: number
  handName?: string
  bestFive?: Card[]
}

export interface GameState {
  seats: Seat[]
  communityCards: Card[]
  deck: Card[]
  street: Street
  pots: Pot[]
  /** 当前行需要跟到的本街下注额 */
  currentBet: number
  /** 本街最小加注增量 */
  minRaise: number
  actionSeatIndex: number | null
  dealerIndex: number
  sbIndex: number
  bbIndex: number
  handNumber: number
  smallBlind: number
  bigBlind: number
  winners: WinnerInfo[] | null
  lastActionLog: string[]
  /** 本手是否已发过手牌 */
  holeCardsDealt: boolean
  /**
   * 本街是否已自愿行动过（盲注不算）。
   * 与 betThisStreet 配合：可行动玩家需 matched 且 acted 才算完成本街。
   */
  actedThisStreet: boolean[]
}
