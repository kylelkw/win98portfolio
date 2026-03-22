import { portfolioConfig } from "./portfolio.config";

export type WindowId = "profile" | "resume" | "linkedin" | "github" | "projects" | "art" | "email" | "browser";
export type IconVariant = "32x32_4" | "16x16_4";
export type BrowserTabMode = "web" | "pdf";
export type BrowserDisplayMode = "embed" | "reader";
export type StartSubmenuId = "projects" | "links";

export interface WindowTemplate {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  statusText: string;
  isOpenByDefault?: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopWindow extends WindowTemplate {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  isMaximized: boolean;
  restoreBounds?: WindowBounds;
}

export interface DragState {
  id: WindowId;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface IconCell {
  col: number;
  row: number;
}

export interface IconDragState {
  id: WindowId;
  startPointerX: number;
  startPointerY: number;
  offsetX: number;
  offsetY: number;
  fromCell: IconCell;
  moved: boolean;
}

export interface IconDragPreview {
  id: WindowId;
  x: number;
  y: number;
}

export interface BrowserTab {
  id: string;
  title: string;
  mode: BrowserTabMode;
  history: string[];
  index: number;
}

export interface BrowserState {
  tabs: BrowserTab[];
  activeTabId: string;
  address: string;
  nextTabNumber: number;
}

export const TASKBAR_DEFAULT_HEIGHT = 36;
export const DESKTOP_PADDING = 8;
export const ICON_CELL_WIDTH = 90;
export const ICON_CELL_HEIGHT = 78;
export const ICON_TILE_WIDTH = 84;
export const ICON_TILE_HEIGHT = 72;

const EMBED_COMPAT_PROTOCOLS = new Set(["http:", "https:"]);

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "about:blank";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function openExternalLink(url: string) {
  window.open(normalizeUrl(url), "_blank", "noopener,noreferrer");
}

export function getUrlTabTitle(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return hostname || "Website";
  } catch {
    return "Website";
  }
}

export function getCurrentTabUrl(tab: BrowserTab) {
  return tab.history[tab.index] ?? tab.history[0] ?? "about:blank";
}

function getYouTubeEmbedUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (!host.endsWith("youtube.com")) {
    return null;
  }

  if (parsed.pathname.startsWith("/embed/")) {
    return parsed.toString();
  }

  if (parsed.pathname === "/watch") {
    const videoId = parsed.searchParams.get("v");
    if (!videoId) {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  const pathSegments = parsed.pathname.split("/").filter(Boolean);
  if (pathSegments.length >= 2 && (pathSegments[0] === "shorts" || pathSegments[0] === "live")) {
    return `https://www.youtube.com/embed/${pathSegments[1]}`;
  }

  return null;
}

function getVimeoEmbedUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, "");
  if (!host.endsWith("vimeo.com")) {
    return null;
  }

  if (host === "player.vimeo.com") {
    return parsed.toString();
  }

  const videoIdMatch = parsed.pathname.match(/(?:video\/)?(\d+)/);
  if (!videoIdMatch) {
    return null;
  }

  return `https://player.vimeo.com/video/${videoIdMatch[1]}`;
}

function getGooglePreviewUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "drive.google.com") {
    const driveFileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (driveFileMatch) {
      return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
    }
  }

  if (host === "docs.google.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[1] === "d") {
      const [docType, , docId] = parts;
      if (docType === "document" || docType === "presentation" || docType === "spreadsheets") {
        return `https://docs.google.com/${docType}/d/${docId}/preview`;
      }
    }
  }

  return null;
}

export function getEmbeddableUrl(rawUrl: string) {
  const normalized = normalizeUrl(rawUrl);
  if (normalized === "about:blank") {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (!EMBED_COMPAT_PROTOCOLS.has(parsed.protocol)) {
      return normalized;
    }

    return getYouTubeEmbedUrl(parsed) ?? getVimeoEmbedUrl(parsed) ?? getGooglePreviewUrl(parsed) ?? normalized;
  } catch {
    return normalized;
  }
}

function shouldBypassCompatProxy(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    return (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be" ||
      host === "vimeo.com" ||
      host.endsWith(".vimeo.com")
    );
  } catch {
    return false;
  }
}

function getPdfPreviewUrl(rawUrl: string) {
  const embeddableUrl = getEmbeddableUrl(rawUrl);
  if (embeddableUrl === "about:blank") {
    return embeddableUrl;
  }

  try {
    const parsed = new URL(embeddableUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathname = parsed.pathname.toLowerCase();

    if (host === "drive.google.com" || host === "docs.google.com" || pathname.endsWith(".pdf")) {
      return embeddableUrl;
    }
  } catch {
    return embeddableUrl;
  }

  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(embeddableUrl)}`;
}

export function getBrowserFrameUrl(
  url: string,
  useCompatibilityMode: boolean,
  mode: BrowserTabMode = "web",
  displayMode: BrowserDisplayMode = "embed",
) {
  if (mode === "pdf") {
    return getPdfPreviewUrl(url);
  }

  const normalizedTargetUrl = normalizeUrl(url);
  if (displayMode === "reader") {
    if (normalizedTargetUrl === "about:blank") {
      return normalizedTargetUrl;
    }
    try {
      const parsed = new URL(normalizedTargetUrl);
      if (!EMBED_COMPAT_PROTOCOLS.has(parsed.protocol)) {
        return normalizedTargetUrl;
      }
    } catch {
      return normalizedTargetUrl;
    }
    return `/api/embed?url=${encodeURIComponent(normalizedTargetUrl)}&view=reader`;
  }

  const frameTargetUrl = getEmbeddableUrl(url);

  if (!useCompatibilityMode || frameTargetUrl === "about:blank" || shouldBypassCompatProxy(frameTargetUrl)) {
    return frameTargetUrl;
  }

  try {
    const parsed = new URL(frameTargetUrl);
    if (!EMBED_COMPAT_PROTOCOLS.has(parsed.protocol)) {
      return frameTargetUrl;
    }
  } catch {
    return frameTargetUrl;
  }

  return `/api/embed?url=${encodeURIComponent(frameTargetUrl)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createTextDocumentDataUrl(filename: string, content: string) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    filename,
  )}</title><style>body{margin:0;background:#fff;color:#000;font-family:"MS Sans Serif",Tahoma,sans-serif;font-size:12px;}pre{margin:0;padding:10px;white-space:pre-wrap;word-break:break-word;}</style></head><body><pre>${escapeHtml(
    content,
  )}</pre></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export function getFileLabelFromUrl(fileUrl: string) {
  const lastSegment = fileUrl.split("/").pop() ?? fileUrl;
  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

export const RESUME_PDF_URL = normalizeUrl(portfolioConfig.resume.url);
export const BROWSER_HOME_URL = normalizeUrl(portfolioConfig.linkedin.url);
export const INITIAL_BROWSER_TAB: BrowserTab = {
  id: "tab-1",
  title: "Home",
  mode: "web",
  history: [BROWSER_HOME_URL],
  index: 0,
};

export const LIVE_LINK_APPS: Partial<Record<WindowId, { url: string; title: string; mode?: BrowserTabMode }>> = {
  resume: { url: RESUME_PDF_URL, title: portfolioConfig.pages.resume, mode: "pdf" },
};
export const DEFAULT_ABOUT_TAB_ID = portfolioConfig.aboutSubtabs[0]?.id ?? "about";

export const WINDOW_TEMPLATES: WindowTemplate[] = [
  {
    id: "profile",
    title: portfolioConfig.pages.about,
    x: 56,
    y: 28,
    width: 620,
    height: 460,
    statusText: "About Me",
    isOpenByDefault: true,
  },
  {
    id: "resume",
    title: portfolioConfig.pages.resume,
    x: 180,
    y: 86,
    width: 362,
    height: 248,
    statusText: "Resume",
  },
  {
    id: "linkedin",
    title: portfolioConfig.pages.linkedin,
    x: 232,
    y: 136,
    width: 362,
    height: 248,
    statusText: "LinkedIn",
  },
  {
    id: "github",
    title: portfolioConfig.pages.github,
    x: 246,
    y: 164,
    width: 362,
    height: 248,
    statusText: "GitHub",
  },
  {
    id: "projects",
    title: portfolioConfig.pages.projects,
    x: 220,
    y: 56,
    width: 620,
    height: 430,
    statusText: "Active project list",
  },
  {
    id: "art",
    title: portfolioConfig.pages.art,
    x: 276,
    y: 74,
    width: 640,
    height: 430,
    statusText: "Artwork collection",
  },
  {
    id: "email",
    title: portfolioConfig.pages.email,
    x: 186,
    y: 126,
    width: 430,
    height: 308,
    statusText: "Email composer",
  },
  {
    id: "browser",
    title: portfolioConfig.pages.browser,
    x: 130,
    y: 34,
    width: 760,
    height: 520,
    statusText: "Done",
  },
];

export const ICON_ORDER: WindowId[] = ["profile", "resume", "linkedin", "github", "projects", "art", "email", "browser"];

export const ICON_INITIAL_CELLS: Record<WindowId, IconCell> = {
  profile: { col: 0, row: 0 },
  resume: { col: 0, row: 1 },
  linkedin: { col: 0, row: 2 },
  github: { col: 0, row: 3 },
  projects: { col: 0, row: 4 },
  art: { col: 0, row: 5 },
  email: { col: 0, row: 6 },
  browser: { col: 0, row: 7 },
};

function cellKey(cell: IconCell) {
  return `${cell.col}:${cell.row}`;
}

export function clampCell(cell: IconCell, maxCol: number, maxRow: number): IconCell {
  return {
    col: clamp(cell.col, 0, maxCol),
    row: clamp(cell.row, 0, maxRow),
  };
}

function findClosestFreeCell(
  preferredCell: IconCell,
  takenKeys: Set<string>,
  maxCol: number,
  maxRow: number,
): IconCell {
  const candidates: Array<{ cell: IconCell; distance: number }> = [];

  for (let row = 0; row <= maxRow; row += 1) {
    for (let col = 0; col <= maxCol; col += 1) {
      const distance = Math.abs(preferredCell.col - col) + Math.abs(preferredCell.row - row);
      candidates.push({ cell: { col, row }, distance });
    }
  }

  candidates.sort((first, second) => {
    if (first.distance !== second.distance) {
      return first.distance - second.distance;
    }
    if (first.cell.row !== second.cell.row) {
      return first.cell.row - second.cell.row;
    }
    return first.cell.col - second.cell.col;
  });

  const available = candidates.find((candidate) => !takenKeys.has(cellKey(candidate.cell)));
  return available ? available.cell : { col: 0, row: 0 };
}

export function normalizeIconCells(
  cells: Record<WindowId, IconCell>,
  maxCol: number,
  maxRow: number,
): Record<WindowId, IconCell> {
  const normalized = {} as Record<WindowId, IconCell>;
  const takenKeys = new Set<string>();

  for (const iconId of ICON_ORDER) {
    const preferredCell = clampCell(cells[iconId] ?? ICON_INITIAL_CELLS[iconId], maxCol, maxRow);
    const preferredKey = cellKey(preferredCell);
    const finalCell = takenKeys.has(preferredKey)
      ? findClosestFreeCell(preferredCell, takenKeys, maxCol, maxRow)
      : preferredCell;

    normalized[iconId] = finalCell;
    takenKeys.add(cellKey(finalCell));
  }

  return normalized;
}
