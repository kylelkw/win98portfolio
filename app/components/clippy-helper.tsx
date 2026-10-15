import type { WindowId } from "../desktop-core";

export type ClippyContext = WindowId | "desktop" | "project";

const TIPS: Record<ClippyContext, string> = {
  minesweeper: "Watch your step! Numbers count nearby mines. Right-click to flag a square, or turn on Flag mode for touch controls.",
  tetris: "Time for a break! Use the arrow keys or on-screen controls. Tetris pauses when you switch windows; choose Resume to keep playing.",
  profile: "This is Kyle's Portfolio Website! If you'd like to know more about his experience, take a look at the resume.",
  desktop: "Need a hand? Open an icon to explore Kyle's portfolio, or start with his resume.",
  resume: "Here's Kyle's resume! It brings together his experience, skills, and selected projects. Have a question? Get in touch.",
  projects: "Curious about what Kyle has built? Select a project to learn more. Use Email Me at the top to request project code.",
  art: "There's a creative side to Kyle, too! Use the arrows to browse his artwork, and select an image for a closer look.",
  email: "Want to work with Kyle or ask about project code? Fill in a subject and message, then choose Send Email to open your email app.",
  linkedin: "You can connect with Kyle on LinkedIn. His projects are a good place to explore what he's been working on, too.",
  browser: "You're in the portfolio's browser! If a page doesn't load, choose Open External to view it directly.",
  project: "Taking a closer look at a project? If you'd like to see the code or learn more about it, contact Kyle.",
};

interface ClippyHelperProps {
  context: ClippyContext;
  projectName?: string;
  isOpen: boolean;
  bottomOffset: number;
  onToggle: () => void;
}

export function ClippyHelper({
  context,
  projectName,
  isOpen,
  bottomOffset,
  onToggle,
}: ClippyHelperProps) {
  const message = context === "project" && projectName
    ? `You're exploring ${projectName}! Contact Kyle if you'd like to see the code or hear more about how it works.`
    : TIPS[context];

  return (
    <aside className="clippy-helper98" aria-label="Clippy navigation helper" style={{ bottom: bottomOffset }}>
      {isOpen ? (
        <div id="clippy-tip" className="clippy-bubble98">
          <button className="clippy-close98" type="button" aria-label="Dismiss Clippy tips" onClick={onToggle}>×</button>
          <p role="status" aria-live="polite" aria-atomic="true">{message}</p>
        </div>
      ) : (
        <div id="clippy-tip" className="clippy-bubble98 clippy-prompt98">
          <button className="clippy-reopen98" type="button" onClick={onToggle}>Need a hand?</button>
        </div>
      )}
      <button
        type="button"
        className="clippy-character98"
        aria-label={isOpen ? "Hide Clippy tips" : "Ask Clippy for help"}
        aria-expanded={isOpen}
        aria-controls="clippy-tip"
        onClick={onToggle}
      >
        <span className="clippy-sprite98" aria-hidden="true" />
      </button>
    </aside>
  );
}
