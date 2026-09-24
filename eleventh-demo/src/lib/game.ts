// Block puzzle rules: 8x8 board, three pieces per round, full rows and columns clear.
export const SIZE = 8
export type Cell = number | null            // colour index or empty
export type Board = Cell[][]
export interface Piece { id: string; cells: [number, number][]; color: number; w: number; h: number }

export const COLORS = ['#ff5d73', '#ffb13b', '#ffe14d', '#4cd97b', '#35c6ff', '#6d7bff', '#c46bff']

const RAW: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [0, 1]], [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1]], [[0, 1], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 0]], [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 1]], [[0, 1], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 1], [1, 1], [2, 1], [1, 0]],
  [[0, 1], [0, 2], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 1], [1, 1], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 1], [1, 1], [2, 1], [2, 0]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0]], [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 2], [1, 0], [1, 1], [1, 2]],
]

let uid = 0
export function randomPiece(): Piece {
  const cells = RAW[Math.floor(Math.random() * RAW.length)]
  return {
    id: `p${uid++}`,
    cells,
    color: Math.floor(Math.random() * COLORS.length),
    w: Math.max(...cells.map(c => c[1])) + 1,
    h: Math.max(...cells.map(c => c[0])) + 1,
  }
}

export const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null))

export function fits(b: Board, p: Piece, r: number, c: number) {
  return p.cells.every(([dr, dc]) => {
    const rr = r + dr, cc = c + dc
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && b[rr][cc] === null
  })
}

export function canPlaceAnywhere(b: Board, p: Piece) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (fits(b, p, r, c)) return true
  return false
}

/** Three new pieces, re-rolled a few times so at least one fits the board. */
export function newTray(b: Board): Piece[] {
  let tray: Piece[] = []
  for (let i = 0; i < 25; i++) {
    tray = [randomPiece(), randomPiece(), randomPiece()]
    if (tray.some(p => canPlaceAnywhere(b, p))) break
  }
  return tray
}

/** Rows and columns that would be full after placing (used for the live preview). */
export function linesAfter(b: Board, p: Piece, r: number, c: number) {
  const filled = (rr: number, cc: number) => b[rr][cc] !== null || p.cells.some(([dr, dc]) => r + dr === rr && c + dc === cc)
  const rows: number[] = [], cols: number[] = []
  for (let i = 0; i < SIZE; i++) {
    if (Array.from({ length: SIZE }, (_, k) => filled(i, k)).every(Boolean)) rows.push(i)
    if (Array.from({ length: SIZE }, (_, k) => filled(k, i)).every(Boolean)) cols.push(i)
  }
  return { rows, cols }
}

export interface PlaceResult { board: Board; cleared: [number, number][]; lines: number; gained: number }

export function place(b: Board, p: Piece, r: number, c: number, combo: number): PlaceResult {
  const board = b.map(row => row.slice())
  p.cells.forEach(([dr, dc]) => { board[r + dr][c + dc] = p.color })
  const { rows, cols } = linesAfter(b, p, r, c)
  const cleared: [number, number][] = []
  rows.forEach(rr => { for (let k = 0; k < SIZE; k++) cleared.push([rr, k]) })
  cols.forEach(cc => { for (let k = 0; k < SIZE; k++) cleared.push([k, cc]) })
  cleared.forEach(([rr, cc]) => { board[rr][cc] = null })
  const lines = rows.length + cols.length
  // placement points + growing bonus for multi-line clears and streaks
  const gained = p.cells.length + (lines ? lines * lines * 10 + combo * lines * 10 : 0)
  return { board, cleared, lines, gained }
}
