export const MINE_SIZE = 9;
export const MINE_COUNT = 10;

export interface MineCell {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

export interface MinesweeperState {
  cells: MineCell[];
  status: "ready" | "playing" | "won" | "lost";
}

export function newMinesweeper(): MinesweeperState {
  return {
    cells: Array.from({ length: MINE_SIZE * MINE_SIZE }, () => ({
      mine: false, adjacent: 0, revealed: false, flagged: false,
    })),
    status: "ready",
  };
}

function neighbors(index: number) {
  const result: number[] = [];
  const row = Math.floor(index / MINE_SIZE);
  const col = index % MINE_SIZE;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const y = row + dy;
      const x = col + dx;
      if ((dx || dy) && y >= 0 && y < MINE_SIZE && x >= 0 && x < MINE_SIZE) {
        result.push(y * MINE_SIZE + x);
      }
    }
  }
  return result;
}

export function flagMine(state: MinesweeperState, index: number): MinesweeperState {
  const cell = state.cells[index];
  if (!cell || cell.revealed || state.status === "won" || state.status === "lost") return state;
  if (!cell.flagged && state.cells.filter((item) => item.flagged).length >= MINE_COUNT) return state;
  return {
    ...state,
    cells: state.cells.map((item, i) => i === index ? { ...item, flagged: !item.flagged } : item),
  };
}

export function revealMine(state: MinesweeperState, index: number, random = Math.random): MinesweeperState {
  const selected = state.cells[index];
  if (!selected || selected.flagged || selected.revealed || state.status === "won" || state.status === "lost") return state;
  const cells = state.cells.map((cell) => ({ ...cell }));

  if (state.status === "ready") {
    const safe = new Set([index, ...neighbors(index)]);
    const candidates = cells.map((_, i) => i).filter((i) => !safe.has(i));
    for (let i = 0; i < MINE_COUNT; i++) {
      const pick = i + Math.floor(random() * (candidates.length - i));
      [candidates[i], candidates[pick]] = [candidates[pick], candidates[i]];
      cells[candidates[i]].mine = true;
    }
    cells.forEach((cell, i) => {
      cell.adjacent = neighbors(i).filter((neighbor) => cells[neighbor].mine).length;
    });
  }

  if (cells[index].mine) {
    cells.forEach((cell) => { if (cell.mine) cell.revealed = true; });
    return { cells, status: "lost" };
  }

  const pending = [index];
  while (pending.length) {
    const current = pending.pop()!;
    const cell = cells[current];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) pending.push(...neighbors(current));
  }
  return { cells, status: cells.every((cell) => cell.mine || cell.revealed) ? "won" : "playing" };
}
