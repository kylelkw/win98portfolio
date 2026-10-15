const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const ts = require("typescript");

function loadGame(name) {
  const source = fs.readFileSync(require.resolve(`../app/games/${name}.ts`), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function("exports", compiled)(exports);
  return exports;
}

const mines = loadGame("minesweeper");
const tetris = loadGame("tetris");

test("Minesweeper places ten mines and keeps first reveals and their neighbors safe", () => {
  for (const index of [0, 4, 40, 80]) {
    const original = mines.newMinesweeper();
    const game = mines.revealMine(original, index, () => 0.25);
    assert.equal(game.cells.filter(cell => cell.mine).length, 10);
    assert.equal(game.cells[index].mine, false);
    assert.equal(game.cells[index].adjacent, 0);
    assert.ok(game.cells.filter(cell => cell.revealed).length > 1);
    assert.ok(original.cells.every(cell => !cell.revealed && !cell.mine));
    game.cells.forEach((cell, i) => {
      const neighbors = game.cells.filter((_, j) => i !== j && Math.abs(Math.floor(i / 9) - Math.floor(j / 9)) <= 1 && Math.abs(i % 9 - j % 9) <= 1);
      assert.equal(cell.adjacent, neighbors.filter(neighbor => neighbor.mine).length);
    });
  }
});

test("Minesweeper flags prevent reveals, can be removed, and cannot exceed ten", () => {
  let game = mines.newMinesweeper();
  for (let i = 0; i < 11; i++) game = mines.flagMine(game, i);
  assert.equal(game.cells.filter(cell => cell.flagged).length, 10);
  assert.equal(mines.revealMine(game, 0), game);
  game = mines.flagMine(game, 0);
  assert.equal(game.cells[0].flagged, false);
  assert.equal(game.status, "ready");
});

test("Minesweeper detects wins and losses and stops terminal games", () => {
  const seeded = mines.revealMine(mines.newMinesweeper(), 40, () => 0.25);
  const mine = seeded.cells.findIndex(cell => cell.mine);
  const lost = mines.revealMine(seeded, mine);
  assert.equal(lost.status, "lost");
  assert.ok(lost.cells.filter(cell => cell.mine).every(cell => cell.revealed));
  assert.equal(mines.flagMine(lost, 0), lost);
  let won = seeded;
  for (let i = 0; i < 81; i++) if (!won.cells[i].mine) won = mines.revealMine(won, i);
  assert.equal(won.status, "won");
  assert.equal(mines.revealMine(won, mine), won);
});

test("Tetris provides seven four-block shapes and prevents crossing walls or the floor", () => {
  for (let i = 0; i < 7; i++) {
    const game = tetris.startTetris(() => (i + 0.5) / 7);
    assert.equal(game.piece.color, i + 1);
    assert.equal(game.piece.shape.flat().filter(Boolean).length, 4);
    assert.ok(tetris.pieceFits(game.board, game.piece));
  }
  let game = tetris.startTetris(() => 0);
  for (let i = 0; i < 20; i++) game = tetris.moveTetris(game, "left");
  assert.equal(game.piece.x, 0);
  for (let i = 0; i < 20; i++) game = tetris.moveTetris(game, "right");
  assert.equal(game.piece.x, 6);
  assert.equal(tetris.pieceFits(game.board, { ...game.piece, y: 19 }), false);
});

test("Tetris rotation fits near walls and movement does not mutate the board", () => {
  let game = tetris.startTetris(() => 0);
  game = tetris.moveTetris(game, "rotate");
  for (let i = 0; i < 20; i++) game = tetris.moveTetris(game, "right");
  const before = JSON.stringify(game);
  const rotated = tetris.moveTetris(game, "rotate");
  assert.ok(tetris.pieceFits(rotated.board, rotated.piece));
  assert.notDeepEqual(rotated.piece.shape, game.piece.shape);
  assert.equal(JSON.stringify(game), before);
  const blocked = { ...game, board: game.board.map(row => row.map(() => 1)) };
  assert.equal(tetris.moveTetris(blocked, "rotate"), blocked);
});

test("Tetris hard drop locks pieces, clears multiple lines, and scores the drop and clear", () => {
  const game = tetris.startTetris(() => 0.15);
  for (const row of [18, 19]) game.board[row] = Array.from({ length: 10 }, (_, x) => x === 4 || x === 5 ? 0 : 1);
  const result = tetris.moveTetris(game, "drop", () => 0.15);
  assert.equal(result.lines, 2);
  assert.equal(result.score, 336);
  assert.equal(result.board.length, 20);
  assert.ok(result.board.every(row => row.length === 10 && row.every(cell => cell === 0)));
  assert.equal(result.status, "playing");
  assert.equal(game.score, 0);
});

test("Tetris paused games ignore inputs and a blocked spawn ends the game", () => {
  const paused = { ...tetris.startTetris(() => 0), status: "paused" };
  assert.equal(tetris.moveTetris(paused, "tick"), paused);
  assert.equal(tetris.moveTetris(paused, "drop"), paused);
  const game = tetris.startTetris(() => 0);
  game.piece.y = 18;
  game.board[0][4] = 6;
  const over = tetris.moveTetris(game, "drop", () => 0.15);
  assert.equal(over.status, "over");
  assert.equal(tetris.moveTetris(over, "left"), over);
});
