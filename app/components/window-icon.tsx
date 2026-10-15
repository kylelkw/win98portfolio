import { Brush, Computer, Explorer100, FileText, FolderOpen, Globe, Winmine1 } from "@react95/icons";
import type { IconVariant, WindowId } from "../desktop-core";

export function WindowIcon({
  id,
  variant,
  className,
}: {
  id: WindowId;
  variant: IconVariant;
  className?: string;
}) {
  if (id === "minesweeper") {
    return <Winmine1 variant={variant} className={className} aria-hidden />;
  }

  if (id === "tetris") {
    const size = variant === "16x16_4" ? 16 : 32;
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} className={className} shapeRendering="crispEdges" aria-hidden="true">
        <rect x="0.5" y="0.5" width="31" height="31" fill="#181b30" stroke="#080b14" />
        <g stroke="#181b30" strokeWidth="1">
          <path d="M10 2h7v7h-7zM2 10h7v7H2zM10 10h7v7h-7zM18 10h7v7h-7z" fill="#aa6aef" />
          <path d="M18 18h6v6h-6zM25 18h5v6h-5zM18 25h6v5h-6zM25 25h5v5h-5z" fill="#30d9ec" />
          <path d="M2 18h7v6H2zM2 25h7v5H2zM10 25h7v5h-7z" fill="#f9b53c" />
        </g>
        <path d="M11 3h4M3 11h4m4 0h4m4 0h4M19 19h3m4 0h3M3 19h4" stroke="#fff8" />
      </svg>
    );
  }

  if (id === "profile") {
    return <Computer variant={variant} className={className} aria-hidden />;
  }

  if (id === "resume") {
    return <FileText variant={variant} className={className} aria-hidden />;
  }

  if (id === "linkedin") {
    return <Globe variant={variant} className={className} aria-hidden />;
  }

  if (id === "projects") {
    return <FolderOpen variant={variant} className={className} aria-hidden />;
  }

  if (id === "email") {
    return <FileText variant={variant} className={className} aria-hidden />;
  }

  if (id === "browser") {
    return <Explorer100 variant={variant} className={className} aria-hidden />;
  }

  if (variant === "16x16_4") {
    return <FileText variant="16x16_4" className={className} aria-hidden />;
  }

  return <Brush variant="32x32_4" className={className} aria-hidden />;
}
