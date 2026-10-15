export const TETRIS_WIDTH = 10;
export const TETRIS_HEIGHT = 20;

const SHAPES = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
];

export interface TetrisPiece {
  shape: number[][];
  x: number;
  y: number;
  color: number;
}

export interface TetrisState {
  board: number[][];
  piece: TetrisPiece | null;
  score: number;
  lines: number;
  status: "ready" | "playing" | "paused" | "over";
}

export type TetrisAction = "left" | "right" | "rotate" | "down" | "drop" | "tick";

function randomPiece(random: () => number): TetrisPiece {
  const index = Math.floor(random() * SHAPES.length);
  const shape = SHAPES[index].map((row) => [...row]);
  return { shape, x: Math.floor((TETRIS_WIDTH - shape.length) / 2), y: 0, color: index + 1 };
}

export function newTetris(): TetrisState {
  return {
    board: Array.from({ length: TETRIS_HEIGHT }, () => Array<number>(TETRIS_WIDTH).fill(0)),
    piece: null, score: 0, lines: 0, status: "ready",
  };
}

export function startTetris(random = Math.random): TetrisState {
  return { ...newTetris(), piece: randomPiece(random), status: "playing" };
}

export function pieceFits(board: number[][], piece: TetrisPiece) {
  return piece.shape.every((row, dy) => row.every((filled, dx) => {
    if (!filled) return true;
    const x = piece.x + dx;
    const y = piece.y + dy;
    return x >= 0 && x < TETRIS_WIDTH && y < TETRIS_HEIGHT && (y < 0 || board[y][x] === 0);
  }));
}

export function clearTetrisLines(board: number[][]) {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = TETRIS_HEIGHT - remaining.length;
  return {
    board: [
      ...Array.from({ length: cleared }, () => Array<number>(TETRIS_WIDTH).fill(0)),
      ...remaining.map((row) => [...row]),
    ],
    cleared,
  };
}

function lockPiece(state: TetrisState, piece: TetrisPiece, random: () => number): TetrisState {
  const board = state.board.map((row) => [...row]);
  let aboveBoard = false;
  piece.shape.forEach((row, dy) => row.forEach((filled, dx) => {
    if (!filled) return;
    if (piece.y + dy < 0) aboveBoard = true;
    else board[piece.y + dy][piece.x + dx] = piece.color;
  }));
  if (aboveBoard) return { ...state, status: "over" };
  const { board: nextBoard, cleared } = clearTetrisLines(board);
  const level = Math.floor(state.lines / 10) + 1;
  const nextPiece = randomPiece(random);
  return {
    board: nextBoard,
    piece: nextPiece,
    score: state.score + [0, 100, 300, 500, 800][cleared] * level,
    lines: state.lines + cleared,
    status: pieceFits(nextBoard, nextPiece) ? "playing" : "over",
  };
}

export function moveTetris(state: TetrisState, action: TetrisAction, random = Math.random): TetrisState {
  if (state.status !== "playing" || !state.piece) return state;
  const piece = state.piece;
  if (action === "left" || action === "right") {
    const moved = { ...piece, x: piece.x + (action === "left" ? -1 : 1) };
    return pieceFits(state.board, moved) ? { ...state, piece: moved } : state;
  }
  if (action === "rotate") {
    const shape = piece.shape[0].map((_, x) => piece.shape.map((row) => row[x]).reverse());
    for (const offset of [0, -1, 1, -2, 2]) {
      const rotated = { ...piece, shape, x: piece.x + offset };
      if (pieceFits(state.board, rotated)) return { ...state, piece: rotated };
    }
    return state;
  }
  if (action === "drop") {
    let dropped = { ...piece };
    while (pieceFits(state.board, { ...dropped, y: dropped.y + 1 })) dropped = { ...dropped, y: dropped.y + 1 };
    return lockPiece({ ...state, score: state.score + (dropped.y - piece.y) * 2 }, dropped, random);
  }
  const lowered = { ...piece, y: piece.y + 1 };
  return pieceFits(state.board, lowered)
    ? { ...state, piece: lowered, score: state.score + (action === "down" ? 1 : 0) }
    : lockPiece(state, piece, random);
}
