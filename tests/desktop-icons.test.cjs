const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, file);

const { ICON_INITIAL_CELLS, ICON_ORDER, ICON_CELL_HEIGHT, ICON_TILE_HEIGHT, normalizeIconCells } = require("../app/desktop-core.ts");

test("all desktop icons fit one column at 720px height, with games below Internet", () => {
  const maxRow = Math.floor((720 - 36 - 16 - ICON_TILE_HEIGHT) / ICON_CELL_HEIGHT);
  const cells = normalizeIconCells(ICON_INITIAL_CELLS, 12, maxRow);
  assert.deepEqual(cells.browser, { col: 0, row: 6 });
  assert.deepEqual(cells.minesweeper, { col: 0, row: 7 });
  assert.deepEqual(cells.tetris, { col: 0, row: 8 });
  assert.equal(new Set(ICON_ORDER.map(id => `${cells[id].col}:${cells[id].row}`)).size, ICON_ORDER.length);
});

test("short-screen overflow starts at the top of the next column", () => {
  const cells = normalizeIconCells(ICON_INITIAL_CELLS, 12, 6);
  assert.deepEqual(cells.minesweeper, { col: 1, row: 0 });
  assert.deepEqual(cells.tetris, { col: 1, row: 1 });
  assert.ok(ICON_ORDER.every(id => cells[id].row <= 6));
});

test("normalization preserves a dragged icon's available position", () => {
  const moved = { ...ICON_INITIAL_CELLS, tetris: { col: 3, row: 2 } };
  const cells = normalizeIconCells(moved, 12, 8);
  assert.deepEqual(cells.tetris, moved.tetris);
});
