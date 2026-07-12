import type {
  Card,
  GameState,
  PlayerAction,
  Seat,
  Street,
  WinnerInfo,
} from './types'
import { createDeck, shuffle } from './deck'
import { compareHandValues, evaluateSeven } from './handEval'
import { computePots } from './pots'

export const DEFAULT_STACK = 10_000
export const DEFAULT_SB = 50
export const DEFAULT_BB = 100

const AI_NAMES = ['VEX', 'NOVA', 'GHOST', 'PULSE', 'HEX'] as const
const SEAT_COUNT = 6

function makeSeat(
  index: number,
  name: string,
  isHero: boolean,
  stack: number,
): Seat {
  return {
    id: `seat-${index}`,
    name,
    isHero,
    isAI: !isHero,
    stack,
    holeCards: null,
    betThisStreet: 0,
    totalBetThisHand: 0,
    folded: false,
    allIn: false,
    sittingOut: false,
  }
}

export function createInitialTable(heroName = '你'): GameState {
  const seats: Seat[] = [
    makeSeat(0, heroName, true, DEFAULT_STACK),
    ...AI_NAMES.map((name, i) => makeSeat(i + 1, name, false, DEFAULT_STACK)),
  ]

  return {
    seats,
    communityCards: [],
    deck: [],
    street: 'handOver',
    pots: [],
    currentBet: 0,
    minRaise: DEFAULT_BB,
    actionSeatIndex: null,
    // First startHand advances to seat 0 as dealer
    dealerIndex: SEAT_COUNT - 1,
    sbIndex: 0,
    bbIndex: 1,
    handNumber: 0,
    smallBlind: DEFAULT_SB,
    bigBlind: DEFAULT_BB,
    winners: null,
    lastActionLog: [],
    holeCardsDealt: false,
    actedThisStreet: seats.map(() => false),
  }
}

function cloneSeats(seats: Seat[]): Seat[] {
  return seats.map((s) => ({
    ...s,
    holeCards: s.holeCards ? s.holeCards.map((c) => ({ ...c })) : null,
  }))
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    seats: cloneSeats(state.seats),
    communityCards: state.communityCards.map((c) => ({ ...c })),
    deck: state.deck.map((c) => ({ ...c })),
    pots: state.pots.map((p) => ({
      amount: p.amount,
      eligibleSeatIds: [...p.eligibleSeatIds],
    })),
    winners: state.winners
      ? state.winners.map((w) => ({
          ...w,
          bestFive: w.bestFive?.map((c) => ({ ...c })),
        }))
      : null,
    lastActionLog: [...state.lastActionLog],
    actedThisStreet: [...state.actedThisStreet],
  }
}

function isInHand(seat: Seat): boolean {
  return !seat.sittingOut
}

function isContender(seat: Seat): boolean {
  return isInHand(seat) && !seat.folded
}

function canStillAct(seat: Seat): boolean {
  return isContender(seat) && !seat.allIn && seat.stack > 0
}

function contenderIndices(state: GameState): number[] {
  return state.seats
    .map((s, i) => (isContender(s) ? i : -1))
    .filter((i) => i >= 0)
}

function canStillActIndices(state: GameState): number[] {
  return state.seats
    .map((s, i) => (canStillAct(s) ? i : -1))
    .filter((i) => i >= 0)
}

/** Next seat clockwise from `fromExclusive` that is in hand (not sitting out). */
function nextInHandSeat(state: GameState, fromExclusive: number): number | null {
  const n = state.seats.length
  for (let step = 1; step <= n; step++) {
    const i = (fromExclusive + step) % n
    if (isInHand(state.seats[i]!)) return i
  }
  return null
}

/** Next seat that still needs a decision this street. */
function nextActorSeat(state: GameState, fromExclusive: number): number | null {
  const n = state.seats.length
  for (let step = 1; step <= n; step++) {
    const i = (fromExclusive + step) % n
    if (needsAction(state, i)) return i
  }
  return null
}

function needsAction(state: GameState, index: number): boolean {
  const seat = state.seats[index]!
  if (!canStillAct(seat)) return false
  if (seat.betThisStreet < state.currentBet) return true
  if (!state.actedThisStreet[index]) return true
  return false
}

function streetIsComplete(state: GameState): boolean {
  for (let i = 0; i < state.seats.length; i++) {
    if (needsAction(state, i)) return false
  }
  // At least someone must be able to have acted, or all remaining are all-in
  const actors = canStillActIndices(state)
  if (actors.length === 0) return true
  return actors.every((i) => state.actedThisStreet[i] && state.seats[i]!.betThisStreet === state.currentBet)
}

function commitChips(seat: Seat, amount: number): number {
  const pay = Math.min(amount, seat.stack)
  seat.stack -= pay
  seat.betThisStreet += pay
  seat.totalBetThisHand += pay
  if (seat.stack === 0) {
    seat.allIn = true
  }
  return pay
}

function refreshPots(state: GameState): void {
  state.pots = computePots(state.seats)
}

export function startHand(state: GameState, rng: () => number = Math.random): GameState {
  const next = cloneState(state)

  // Bust-outs sit out
  for (const seat of next.seats) {
    if (seat.stack <= 0) {
      seat.sittingOut = true
      seat.stack = 0
    }
  }

  const inHand = next.seats
    .map((s, i) => (isInHand(s) ? i : -1))
    .filter((i) => i >= 0)

  if (inHand.length < 2) {
    next.street = 'handOver'
    next.actionSeatIndex = null
    next.holeCardsDealt = false
    next.lastActionLog = [...next.lastActionLog, '无法开局：可参与玩家不足 2 人']
    return next
  }

  // Advance dealer among players in hand
  const dealer = nextInHandSeat(next, next.dealerIndex)
  if (dealer === null) return state
  next.dealerIndex = dealer

  // Blinds: heads-up dealer is SB; otherwise SB = dealer+1
  if (inHand.length === 2) {
    next.sbIndex = next.dealerIndex
    next.bbIndex = nextInHandSeat(next, next.dealerIndex)!
  } else {
    next.sbIndex = nextInHandSeat(next, next.dealerIndex)!
    next.bbIndex = nextInHandSeat(next, next.sbIndex)!
  }

  // Reset per-hand seat fields for everyone; sittingOut stay out
  for (const seat of next.seats) {
    seat.holeCards = null
    seat.betThisStreet = 0
    seat.totalBetThisHand = 0
    seat.folded = seat.sittingOut
    seat.allIn = false
  }

  next.handNumber += 1
  next.communityCards = []
  next.winners = null
  next.street = 'preflop'
  next.currentBet = 0
  next.minRaise = next.bigBlind
  next.actedThisStreet = next.seats.map(() => false)
  next.holeCardsDealt = false
  next.lastActionLog = [`第 ${next.handNumber} 手开始`]

  // Post blinds
  const sbSeat = next.seats[next.sbIndex]!
  const bbSeat = next.seats[next.bbIndex]!
  const sbPosted = commitChips(sbSeat, next.smallBlind)
  const bbPosted = commitChips(bbSeat, next.bigBlind)
  // Facing amount is highest posted this street (handles short blinds)
  next.currentBet = Math.max(
    ...next.seats.map((s) => s.betThisStreet),
  )
  next.minRaise = next.bigBlind
  next.lastActionLog.push(
    `${sbSeat.name} 下小盲 ${sbPosted}`,
    `${bbSeat.name} 下大盲 ${bbPosted}`,
  )

  // Shuffle & deal 2 hole cards to each in-hand player (clockwise from SB)
  let deck = shuffle(createDeck(), rng)
  const dealOrder: number[] = []
  {
    let idx = next.sbIndex
    for (let k = 0; k < inHand.length; k++) {
      dealOrder.push(idx)
      idx = nextInHandSeat(next, idx)!
    }
  }
  for (let round = 0; round < 2; round++) {
    for (const seatIdx of dealOrder) {
      const card = deck[0]
      if (!card) break
      deck = deck.slice(1)
      const seat = next.seats[seatIdx]!
      seat.holeCards = seat.holeCards ? [...seat.holeCards, card] : [card]
    }
  }
  next.deck = deck
  next.holeCardsDealt = true

  refreshPots(next)

  // First to act: next can-still-act after BB (HU: SB/dealer acts first)
  const first = nextActorFrom(next, next.bbIndex)
  next.actionSeatIndex = first

  // If nobody can act (everyone all-in from blinds) → runout
  if (first === null || canStillActIndices(next).length <= 1 && contenderIndices(next).length >= 2 && streetIsComplete(next)) {
    return maybeContinueAfterAction(next)
  }

  // Edge: only one can act and everyone matched? rare short stacks
  if (contenderIndices(next).length <= 1) {
    return awardUncontested(next)
  }

  return next
}

function nextActorFrom(state: GameState, fromExclusive: number): number | null {
  return nextActorSeat(state, fromExclusive)
}

export function isHeroTurn(state: GameState): boolean {
  if (state.actionSeatIndex === null) return false
  if (state.street === 'handOver' || state.street === 'showdown') return false
  const seat = state.seats[state.actionSeatIndex]
  return !!seat?.isHero && canStillAct(seat)
}

export function getRaiseBounds(
  state: GameState,
): { min: number; max: number } | null {
  if (state.actionSeatIndex === null) return null
  if (state.street === 'handOver' || state.street === 'showdown') return null
  const seat = state.seats[state.actionSeatIndex]!
  if (!canStillAct(seat)) return null

  const toCall = Math.max(0, state.currentBet - seat.betThisStreet)
  const max = seat.betThisStreet + seat.stack
  // Min target total this street for a full raise
  const min = state.currentBet + state.minRaise

  // Need chips beyond a call to raise
  if (seat.stack <= toCall) return null
  // Can at least put more than currentBet
  if (max <= state.currentBet) return null

  // Short all-in raise: max may be < min; still allow all-in via allIn action.
  // Raise action only legal when max >= min OR we allow short via amount=max.
  // Spec: min/max are 本街总投入目标; if max < min, return bounds for all-in short
  // and applyAction will accept all-in short only.
  if (max < min) {
    return { min: max, max }
  }
  return { min, max }
}

export function getLegalActions(state: GameState): PlayerAction[] {
  if (state.actionSeatIndex === null) return []
  if (state.street === 'handOver' || state.street === 'showdown') return []
  const seat = state.seats[state.actionSeatIndex]!
  if (!canStillAct(seat)) return []

  const actions: PlayerAction[] = []
  const toCall = Math.max(0, state.currentBet - seat.betThisStreet)

  actions.push({ type: 'fold' })

  if (toCall === 0) {
    actions.push({ type: 'check' })
  } else {
    // Call (possibly all-in call)
    actions.push({ type: 'call' })
  }

  const bounds = getRaiseBounds(state)
  if (bounds && bounds.max > state.currentBet) {
    // Full raise available if max >= full min; short only when max < full minRaise target
    const fullMin = state.currentBet + state.minRaise
    if (bounds.max >= fullMin) {
      actions.push({ type: 'raise', amount: bounds.min })
    }
  }

  // All-in if has chips (distinct from call when stack > toCall, or same when all-in call)
  if (seat.stack > 0) {
    actions.push({ type: 'allIn' })
  }

  return actions
}

function isActionLegal(state: GameState, action: PlayerAction): boolean {
  const legal = getLegalActions(state)
  if (legal.length === 0) return false

  if (action.type === 'fold') return legal.some((a) => a.type === 'fold')
  if (action.type === 'check') return legal.some((a) => a.type === 'check')
  if (action.type === 'call') return legal.some((a) => a.type === 'call')
  if (action.type === 'allIn') return legal.some((a) => a.type === 'allIn')
  if (action.type === 'raise') {
    if (!legal.some((a) => a.type === 'raise' || a.type === 'allIn')) {
      // raise only if full raise listed; short all-in must use allIn
    }
    const bounds = getRaiseBounds(state)
    if (!bounds || action.amount === undefined) return false
    const seat = state.seats[state.actionSeatIndex!]!
    const amount = action.amount
    if (amount < bounds.min || amount > bounds.max) return false
    // Must put in more chips
    if (amount <= seat.betThisStreet) return false
    if (amount - seat.betThisStreet > seat.stack) return false
    // Full min raise OR all-in short (amount === max && max may equal short stack)
    const fullMin = state.currentBet + state.minRaise
    if (amount < fullMin && amount < bounds.max) return false
    // Prefer raise only when amount >= fullMin; allow amount === max always when in bounds
    if (amount < fullMin && amount === bounds.max) {
      // short all-in as raise amount — accept
      return true
    }
    if (amount < fullMin) return false
    return legal.some((a) => a.type === 'raise')
  }
  return false
}

export function applyAction(state: GameState, action: PlayerAction): GameState {
  if (state.actionSeatIndex === null) return state
  if (state.street === 'handOver' || state.street === 'showdown') return state
  if (!isActionLegal(state, action)) return state

  const next = cloneState(state)
  const seatIndex = next.actionSeatIndex!
  const seat = next.seats[seatIndex]!
  const prevBet = next.currentBet
  let aggressiveFullRaise = false
  let increasedBet = false

  switch (action.type) {
    case 'fold': {
      seat.folded = true
      next.actedThisStreet[seatIndex] = true
      next.lastActionLog.push(`${seat.name} 弃牌`)
      break
    }
    case 'check': {
      next.actedThisStreet[seatIndex] = true
      next.lastActionLog.push(`${seat.name} 过牌`)
      break
    }
    case 'call': {
      const toCall = Math.max(0, next.currentBet - seat.betThisStreet)
      const paid = commitChips(seat, toCall)
      next.actedThisStreet[seatIndex] = true
      next.lastActionLog.push(
        paid < toCall || seat.allIn
          ? `${seat.name} 跟注全下 ${paid}`
          : `${seat.name} 跟注 ${paid}`,
      )
      break
    }
    case 'raise': {
      const target = action.amount!
      const toAdd = target - seat.betThisStreet
      commitChips(seat, toAdd)
      const newBet = seat.betThisStreet
      if (newBet > prevBet) {
        increasedBet = true
        const raiseSize = newBet - prevBet
        if (raiseSize >= next.minRaise) {
          next.minRaise = raiseSize
          aggressiveFullRaise = true
        }
        next.currentBet = newBet
      }
      next.actedThisStreet[seatIndex] = true
      next.lastActionLog.push(
        seat.allIn
          ? `${seat.name} 加注全下至 ${newBet}`
          : `${seat.name} 加注至 ${newBet}`,
      )
      break
    }
    case 'allIn': {
      const paid = commitChips(seat, seat.stack)
      const newBet = seat.betThisStreet
      if (newBet > prevBet) {
        increasedBet = true
        const raiseSize = newBet - prevBet
        if (raiseSize >= next.minRaise) {
          next.minRaise = raiseSize
          aggressiveFullRaise = true
        }
        next.currentBet = newBet
      }
      next.actedThisStreet[seatIndex] = true
      next.lastActionLog.push(`${seat.name} 全下 ${paid}`)
      break
    }
  }

  // Full raise reopens action for others who can still act
  if (aggressiveFullRaise) {
    for (let i = 0; i < next.seats.length; i++) {
      next.actedThisStreet[i] = i === seatIndex
    }
  } else if (increasedBet) {
    // Incomplete raise: those who already matched old bet still need chips if behind
    // Do not clear acted flags — needsAction uses bet mismatch
  }

  refreshPots(next)
  return maybeContinueAfterAction(next, seatIndex)
}

function maybeContinueAfterAction(
  state: GameState,
  lastActor: number | null = null,
): GameState {
  // Uncontested: only one contender left
  const contenders = contenderIndices(state)
  if (contenders.length <= 1) {
    return awardUncontested(state)
  }

  // Street / betting round complete?
  if (!streetIsComplete(state)) {
    const from = lastActor ?? state.actionSeatIndex ?? state.bbIndex
    state.actionSeatIndex = nextActorFrom(state, from)
    // Safety: if no next actor but street not complete, force complete path
    if (state.actionSeatIndex === null) {
      return advanceOrShowdown(state)
    }
    return state
  }

  return advanceOrShowdown(state)
}

function advanceOrShowdown(state: GameState): GameState {
  const actorsLeft = canStillActIndices(state)
  const contenders = contenderIndices(state)

  // Betting finished for this street
  // If ≤1 can act and ≥2 contenders → all-in runout
  if (actorsLeft.length <= 1 && contenders.length >= 2) {
    // Still need remaining streets if not on river yet; if more betting possible with 1 actor?
    // Standard: if only one (or zero) can act, no more betting — run out board.
    // Exception: if we're mid-hand and one player can still act but others all-in,
    // they don't get to bet alone — runout.
    return runoutAndShowdown(state)
  }

  // Normal street advance
  if (state.street === 'preflop') {
    return goToStreet(state, 'flop', 3)
  }
  if (state.street === 'flop') {
    return goToStreet(state, 'turn', 1)
  }
  if (state.street === 'turn') {
    return goToStreet(state, 'river', 1)
  }
  if (state.street === 'river') {
    return showdown(state)
  }

  return state
}

function dealFromDeck(state: GameState, count: number): Card[] {
  const dealt: Card[] = []
  for (let i = 0; i < count; i++) {
    const card = state.deck[0]
    if (!card) break
    state.deck = state.deck.slice(1)
    dealt.push(card)
  }
  return dealt
}

function resetStreetBets(state: GameState): void {
  for (const seat of state.seats) {
    seat.betThisStreet = 0
  }
  state.currentBet = 0
  state.minRaise = state.bigBlind
  state.actedThisStreet = state.seats.map(() => false)
}

function firstActorPostflop(state: GameState): number | null {
  // First contender who can act, starting from seat left of dealer (SB position)
  // Scan from dealer (exclusive) clockwise
  const n = state.seats.length
  for (let step = 1; step <= n; step++) {
    const i = (state.dealerIndex + step) % n
    if (needsAction(state, i) || canStillAct(state.seats[i]!)) {
      if (canStillAct(state.seats[i]!)) return i
    }
  }
  return null
}

function goToStreet(
  state: GameState,
  street: Street,
  cardsToDeal: number,
): GameState {
  resetStreetBets(state)
  const cards = dealFromDeck(state, cardsToDeal)
  state.communityCards = [...state.communityCards, ...cards]
  state.street = street
  state.lastActionLog.push(
    street === 'flop'
      ? `翻牌 ${cards.length} 张`
      : street === 'turn'
        ? '转牌'
        : street === 'river'
          ? '河牌'
          : `进入 ${street}`,
  )
  refreshPots(state)

  const actors = canStillActIndices(state)
  if (actors.length <= 1) {
    // No betting possible
    if (contenderIndices(state).length >= 2) {
      return runoutAndShowdown(state)
    }
    return awardUncontested(state)
  }

  // Mark needs: all canStillAct need to act (acted=false, currentBet=0)
  const first = firstActorPostflop(state)
  state.actionSeatIndex = first
  if (first === null) {
    return runoutAndShowdown(state)
  }
  return state
}

function runoutAndShowdown(state: GameState): GameState {
  // Deal remaining community to 5
  const need = 5 - state.communityCards.length
  if (need > 0) {
    const cards = dealFromDeck(state, need)
    state.communityCards = [...state.communityCards, ...cards]
    state.lastActionLog.push(`全下发完公共牌 (${cards.length})`)
  }
  // Clear street bets display
  for (const seat of state.seats) {
    seat.betThisStreet = 0
  }
  state.currentBet = 0
  state.actionSeatIndex = null
  return showdown(state)
}

function awardUncontested(state: GameState): GameState {
  refreshPots(state)
  const contenders = contenderIndices(state)
  const winnerIdx = contenders[0]
  if (winnerIdx === undefined) {
    state.street = 'handOver'
    state.actionSeatIndex = null
    state.winners = []
    return state
  }

  const winner = state.seats[winnerIdx]!
  const total = state.pots.reduce((s, p) => s + p.amount, 0)
  // Also include any chips still in totalBet if pots empty edge case
  const potTotal =
    total > 0
      ? total
      : state.seats.reduce((s, seat) => s + seat.totalBetThisHand, 0)

  winner.stack += potTotal
  state.winners = [{ seatId: winner.id, amount: potTotal }]
  state.street = 'handOver'
  state.actionSeatIndex = null
  state.lastActionLog.push(`${winner.name} 无人争夺赢得 ${potTotal}`)
  // Clear bet trackers into pots already awarded
  for (const seat of state.seats) {
    seat.betThisStreet = 0
    seat.totalBetThisHand = 0
  }
  state.pots = []
  return state
}

function showdown(state: GameState): GameState {
  state.street = 'showdown'
  state.actionSeatIndex = null
  refreshPots(state)

  const board = state.communityCards
  const winnersAcc = new Map<string, WinnerInfo>()

  const handCache = new Map<string, ReturnType<typeof evaluateSeven>>()
  for (const idx of contenderIndices(state)) {
    const seat = state.seats[idx]!
    if (!seat.holeCards || seat.holeCards.length < 2) continue
    if (board.length < 3) continue
    const seven = [...seat.holeCards, ...board]
    if (seven.length < 5) continue
    handCache.set(seat.id, evaluateSeven(seven))
  }

  for (const pot of state.pots) {
    const eligible = pot.eligibleSeatIds.filter((id) => handCache.has(id))
    if (eligible.length === 0) {
      // Only folded contributors — should not happen if uncontested handled; skip
      continue
    }
    if (eligible.length === 1) {
      addWinnings(state, winnersAcc, eligible[0]!, pot.amount, handCache)
      continue
    }

    let bestIds: string[] = []
    let bestVal = handCache.get(eligible[0]!)!
    for (const id of eligible) {
      const v = handCache.get(id)!
      const cmp = compareHandValues(v, bestVal)
      if (cmp > 0) {
        bestVal = v
        bestIds = [id]
      } else if (cmp === 0) {
        if (bestIds.length === 0) bestIds = [id]
        else bestIds.push(id)
      }
    }
    if (bestIds.length === 0) bestIds = [eligible[0]!]

    distributePot(state, winnersAcc, bestIds, pot.amount, handCache)
  }

  state.winners = [...winnersAcc.values()]
  state.street = 'handOver'
  state.lastActionLog.push('摊牌结束')
  for (const seat of state.seats) {
    seat.betThisStreet = 0
    seat.totalBetThisHand = 0
  }
  state.pots = []
  return state
}

function addWinnings(
  state: GameState,
  acc: Map<string, WinnerInfo>,
  seatId: string,
  amount: number,
  hands: Map<string, ReturnType<typeof evaluateSeven>>,
): void {
  const seat = state.seats.find((s) => s.id === seatId)
  if (!seat) return
  seat.stack += amount
  const hand = hands.get(seatId)
  const prev = acc.get(seatId)
  if (prev) {
    prev.amount += amount
  } else {
    acc.set(seatId, {
      seatId,
      amount,
      handName: hand?.name,
      bestFive: hand?.bestFive.map((c) => ({ ...c })),
    })
  }
}

/**
 * Split pot among winners; odd chips to winner closest to dealer left
 * (scan from dealer+1 clockwise).
 */
function distributePot(
  state: GameState,
  acc: Map<string, WinnerInfo>,
  winnerIds: string[],
  amount: number,
  hands: Map<string, ReturnType<typeof evaluateSeven>>,
): void {
  if (winnerIds.length === 0) return
  if (winnerIds.length === 1) {
    addWinnings(state, acc, winnerIds[0]!, amount, hands)
    return
  }

  const share = Math.floor(amount / winnerIds.length)
  let remainder = amount - share * winnerIds.length

  // Order winners by distance from dealer left
  const order = seatOrderFromDealerLeft(state)
  const orderedWinners = order.filter((id) => winnerIds.includes(id))

  for (const id of orderedWinners) {
    let gain = share
    if (remainder > 0) {
      gain += 1
      remainder -= 1
    }
    addWinnings(state, acc, id, gain, hands)
  }
}

function seatOrderFromDealerLeft(state: GameState): string[] {
  const n = state.seats.length
  const ids: string[] = []
  for (let step = 1; step <= n; step++) {
    const i = (state.dealerIndex + step) % n
    ids.push(state.seats[i]!.id)
  }
  return ids
}
