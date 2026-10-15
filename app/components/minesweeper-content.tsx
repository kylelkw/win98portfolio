"use client";

import { useEffect, useState } from "react";
import { flagMine, MINE_COUNT, MINE_SIZE, newMinesweeper, revealMine } from "../games/minesweeper";

export function MinesweeperContent({ active = true }: { active?: boolean }) {
  const [game, setGame] = useState(newMinesweeper);
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const flags = game.cells.filter((cell) => cell.flagged).length;

  useEffect(() => {
    if (!active || game.status !== "playing") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active, game.status]);

  const status = game.status === "won" ? "You cleared the board!"
    : game.status === "lost" ? "You hit a mine. Try a new game!"
      : game.status === "ready" ? "Choose a square to start. Your first reveal is safe."
        : "Find the mines without opening them.";

  return (
    <section className="mini-game98" aria-label="Minesweeper game">
      <div className="game-toolbar98">
        <span aria-label={`${MINE_COUNT - flags} flags remaining`}>Mines: {MINE_COUNT - flags}</span>
        <button type="button" onClick={() => {
          setGame(newMinesweeper());
          setSeconds(0);
          setFlagMode(false);
        }}>New game</button>
        <span>Time: {seconds}s</span>
      </div>
      <p className="game-status98" role="status">{status}</p>
      <div className="mine-board98" role="group" aria-label="Minesweeper board">
        {game.cells.map((cell, index) => {
          const text = cell.revealed ? cell.mine ? "✹" : cell.adjacent || "" : cell.flagged ? "⚑" : "";
          const label = cell.revealed ? cell.mine ? "mine" : `${cell.adjacent} adjacent mines`
            : cell.flagged ? "flagged" : "covered";
          return (
            <button
              key={index}
              type="button"
              className={`mine-cell98 ${cell.revealed ? "revealed" : ""} ${cell.revealed && cell.mine ? "mine" : ""}`}
              data-count={cell.revealed ? cell.adjacent : undefined}
              aria-label={`Row ${Math.floor(index / MINE_SIZE) + 1}, column ${index % MINE_SIZE + 1}, ${label}`}
              disabled={cell.revealed || game.status === "won" || game.status === "lost"}
              onClick={() => setGame((current) => flagMode ? flagMine(current, index) : revealMine(current, index))}
              onContextMenu={(event) => {
                event.preventDefault();
                setGame((current) => flagMine(current, index));
              }}
            >{text}</button>
          );
        })}
      </div>
      <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode((value) => !value)}>
        {flagMode ? "Flag mode: On" : "Flag mode: Off"}
      </button>
      <p className="game-help98">Tap to reveal. Right-click to flag, or turn on Flag mode and tap.</p>
    </section>
  );
}
