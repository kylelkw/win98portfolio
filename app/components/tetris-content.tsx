"use client";

import { useEffect, useRef, useState } from "react";
import { moveTetris, newTetris, startTetris, type TetrisAction } from "../games/tetris";

export function TetrisContent({ active = true }: { active?: boolean }) {
  const [game, setGame] = useState(newTetris);
  const controlsRef = useRef<HTMLElement | null>(null);
  const level = Math.floor(game.lines / 10) + 1;

  useEffect(() => {
    if (!active) setGame((current) => current.status === "playing" ? { ...current, status: "paused" } : current);
  }, [active]);

  useEffect(() => {
    const pause = () => setGame((current) => current.status === "playing" ? { ...current, status: "paused" } : current);
    const onVisibility = () => { if (document.hidden) pause(); };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!active || game.status !== "playing") return;
    const timer = window.setInterval(() => setGame((current) => moveTetris(current, "tick")), Math.max(100, 700 - (level - 1) * 55));
    return () => window.clearInterval(timer);
  }, [active, game.status, level]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      const actions: Record<string, TetrisAction> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", ArrowDown: "down", " ": "drop",
      };
      if (event.key.toLowerCase() === "p" || event.key === "Escape") {
        if (event.repeat) return;
        event.preventDefault();
        setGame((current) => current.status === "playing" ? { ...current, status: "paused" }
          : current.status === "paused" && event.key !== "Escape" ? { ...current, status: "playing" } : current);
      } else if (actions[event.key] && game.status === "playing") {
        if (event.key === " " && target.closest("button")) return;
        if (event.repeat && (event.key === " " || event.key === "ArrowUp")) return;
        event.preventDefault();
        setGame((current) => moveTetris(current, actions[event.key]));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, game.status]);

  const move = (action: TetrisAction) => {
    setGame((current) => moveTetris(current, action));
    controlsRef.current?.focus({ preventScroll: true });
  };
  const display = game.board.map((row) => [...row]);
  if (game.piece && game.status !== "over") {
    const piece = game.piece;
    piece.shape.forEach((row, dy) => row.forEach((filled, dx) => {
      if (filled && piece.y + dy >= 0) display[piece.y + dy][piece.x + dx] = piece.color;
    }));
  }

  return (
    <section ref={controlsRef} tabIndex={0} className="mini-game98 tetris-game98" aria-label="Tetris game">
      <div className="game-toolbar98">
        <button type="button" onClick={() => {
          setGame(startTetris());
          controlsRef.current?.focus({ preventScroll: true });
        }}>{game.status === "ready" ? "Start game" : "New game"}</button>
        <button type="button" disabled={game.status === "ready" || game.status === "over"} onClick={() => {
          setGame((current) => ({ ...current, status: current.status === "paused" ? "playing" : "paused" }));
          controlsRef.current?.focus({ preventScroll: true });
        }}>{game.status === "paused" ? "Resume" : "Pause"}</button>
      </div>
      <div className="tetris-stats98"><span>Score: {game.score}</span><span>Lines: {game.lines}</span><span>Level: {level}</span></div>
      <p className="game-status98" role="status">{
        game.status === "ready" ? "Ready when you are!" : game.status === "over" ? "Game over. Start a new game!"
          : game.status === "paused" ? "Paused. Choose Resume to continue." : "Clear full rows to score points."
      }</p>
      <div className="tetris-board98" role="img" aria-label={`Tetris board, ${game.lines} cleared lines, score ${game.score}`}>
        {display.flatMap((row, y) => row.map((color, x) => <span key={`${y}-${x}`} className="tetris-cell98" data-color={color} aria-hidden="true" />))}
      </div>
      <div className="tetris-controls98" aria-label="Tetris touch controls">
        <button type="button" aria-label="Move left" disabled={game.status !== "playing"} onClick={() => move("left")}>←</button>
        <button type="button" aria-label="Rotate piece" disabled={game.status !== "playing"} onClick={() => move("rotate")}>↻</button>
        <button type="button" aria-label="Move right" disabled={game.status !== "playing"} onClick={() => move("right")}>→</button>
        <button type="button" aria-label="Soft drop" disabled={game.status !== "playing"} onClick={() => move("down")}>↓</button>
        <button type="button" className="tetris-hard-drop98" disabled={game.status !== "playing"} onClick={() => move("drop")}>Hard drop</button>
      </div>
      <p className="game-help98">← → move · ↑ rotate · ↓ down · Space drop · P pause. Touch controls work too.</p>
    </section>
  );
}
