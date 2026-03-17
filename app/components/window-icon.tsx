import { Brush, Computer, Explorer100, FileText, FolderOpen, Globe } from "@react95/icons";
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
