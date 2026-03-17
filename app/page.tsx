"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Desktop,
  Explorer100,
  FlyingWindows100,
  FolderOpen,
  Mmsys120,
} from "@react95/icons";
import { AboutContent } from "./components/about-content";
import { ArtSlideshowContent } from "./components/art-slideshow-content";
import { BrowserShellContent } from "./components/browser-shell-content";
import { MobilePortfolioContent, type MobileSectionId } from "./components/mobile-portfolio-content";
import { WindowIcon } from "./components/window-icon";
import {
  BROWSER_HOME_URL,
  DEFAULT_ABOUT_TAB_ID,
  DESKTOP_PADDING,
  ICON_CELL_HEIGHT,
  ICON_CELL_WIDTH,
  ICON_INITIAL_CELLS,
  ICON_ORDER,
  ICON_TILE_HEIGHT,
  ICON_TILE_WIDTH,
  INITIAL_BROWSER_TAB,
  LIVE_LINK_APPS,
  TASKBAR_DEFAULT_HEIGHT,
  WINDOW_TEMPLATES,
  clamp,
  clampCell,
  createTextDocumentDataUrl,
  getBrowserFrameUrl,
  getCurrentTabUrl,
  getFileLabelFromUrl,
  getUrlTabTitle,
  normalizeIconCells,
  normalizeUrl,
  openExternalLink,
  type BrowserTab,
  type BrowserDisplayMode,
  type BrowserState,
  type DesktopWindow,
  type DragState,
  type IconCell,
  type IconDragPreview,
  type IconDragState,
  type StartSubmenuId,
  type WindowId,
  type BrowserTabMode,
} from "./desktop-core";
import { portfolioConfig } from "./portfolio.config";

export default function Home() {
  const [windows, setWindows] = useState<DesktopWindow[]>(() =>
    WINDOW_TEMPLATES.map((windowTemplate, index) => ({
      ...windowTemplate,
      isOpen: Boolean(windowTemplate.isOpenByDefault),
      isMinimized: false,
      zIndex: index + 20,
      isMaximized: false,
    })),
  );
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<WindowId | null>(null);
  const [iconCells, setIconCells] = useState<Record<WindowId, IconCell>>(ICON_INITIAL_CELLS);
  const [draggingIcon, setDraggingIcon] = useState<IconDragPreview | null>(null);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);
  const [activeStartSubmenu, setActiveStartSubmenu] = useState<StartSubmenuId | null>(null);
  const [aboutTab, setAboutTab] = useState<string>(DEFAULT_ABOUT_TAB_ID);
  const [clock, setClock] = useState(() => new Date());
  const [taskbarHeight, setTaskbarHeight] = useState(TASKBAR_DEFAULT_HEIGHT);
  const [useBrowserCompatibilityMode, setUseBrowserCompatibilityMode] = useState(true);
  const [browserDisplayMode, setBrowserDisplayMode] = useState<BrowserDisplayMode>("embed");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<MobileSectionId>("about");
  const [emailSubject, setEmailSubject] = useState(
    () => portfolioConfig.contactEmail.defaultSubject ?? "Portfolio Inquiry",
  );
  const [emailBody, setEmailBody] = useState(() => `Hi ${portfolioConfig.name},\n\n`);
  const [artImageUrls, setArtImageUrls] = useState<string[]>([]);
  const [artSlideIndex, setArtSlideIndex] = useState(0);
  const [isLoadingArtImages, setIsLoadingArtImages] = useState(true);
  const [artGalleryError, setArtGalleryError] = useState<string | null>(null);
  const [browserState, setBrowserState] = useState<BrowserState>({
    tabs: [INITIAL_BROWSER_TAB],
    activeTabId: INITIAL_BROWSER_TAB.id,
    address: getCurrentTabUrl(INITIAL_BROWSER_TAB),
    nextTabNumber: 2,
  });

  const dragState = useRef<DragState | null>(null);
  const iconDragState = useRef<IconDragState | null>(null);
  const suppressIconClick = useRef(false);
  const taskbarRef = useRef<HTMLElement | null>(null);
  const hasCenteredAboutWindow = useRef(false);

  const topWindowId = useMemo(() => {
    let topWindow: DesktopWindow | undefined;
    for (const windowItem of windows) {
      if (!windowItem.isOpen || windowItem.isMinimized) {
        continue;
      }
      if (!topWindow || windowItem.zIndex > topWindow.zIndex) {
        topWindow = windowItem;
      }
    }
    return topWindow?.id;
  }, [windows]);

  const activeBrowserTab = useMemo(() => {
    const explicitTab = browserState.tabs.find((tab) => tab.id === browserState.activeTabId);
    return explicitTab ?? browserState.tabs[0];
  }, [browserState.activeTabId, browserState.tabs]);

  const currentBrowserUrl = activeBrowserTab ? getCurrentTabUrl(activeBrowserTab) : "about:blank";
  const browserFrameUrl = getBrowserFrameUrl(
    currentBrowserUrl,
    useBrowserCompatibilityMode,
    activeBrowserTab?.mode ?? "web",
    browserDisplayMode,
  );
  const canBrowserGoBack = activeBrowserTab ? activeBrowserTab.index > 0 : false;
  const canBrowserGoForward = activeBrowserTab
    ? activeBrowserTab.index < activeBrowserTab.history.length - 1
    : false;

  const getDesktopBounds = useCallback(() => {
    const maxWidth = Math.max(260, window.innerWidth - DESKTOP_PADDING * 2);
    const maxHeight = Math.max(180, window.innerHeight - taskbarHeight - DESKTOP_PADDING * 2);
    return { maxWidth, maxHeight };
  }, [taskbarHeight]);

  const getIconGridLimits = useCallback(() => {
    const { maxWidth, maxHeight } = getDesktopBounds();
    const maxCol = Math.max(0, Math.floor((maxWidth - ICON_TILE_WIDTH) / ICON_CELL_WIDTH));
    const maxRow = Math.max(0, Math.floor((maxHeight - ICON_TILE_HEIGHT) / ICON_CELL_HEIGHT));
    const maxX = DESKTOP_PADDING + maxCol * ICON_CELL_WIDTH;
    const maxY = DESKTOP_PADDING + maxRow * ICON_CELL_HEIGHT;
    return { maxCol, maxRow, maxX, maxY };
  }, [getDesktopBounds]);

  const cellToPixel = useCallback(
    (cell: IconCell) => ({
      x: DESKTOP_PADDING + cell.col * ICON_CELL_WIDTH,
      y: DESKTOP_PADDING + cell.row * ICON_CELL_HEIGHT,
    }),
    [],
  );

  const focusWindow = (id: WindowId, forceOpen = false) => {
    setWindows((previousWindows) => {
      const nextZ = Math.max(0, ...previousWindows.map((windowItem) => windowItem.zIndex)) + 1;
      return previousWindows.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              isOpen: forceOpen ? true : windowItem.isOpen,
              isMinimized: forceOpen ? false : windowItem.isMinimized,
              zIndex: nextZ,
            }
          : windowItem,
      );
    });
  };

  const closeStartMenu = () => {
    setStartMenuOpen(false);
    setActiveStartSubmenu(null);
  };

  const openWindow = (id: WindowId) => {
    closeStartMenu();
    focusWindow(id, true);
  };

  const closeWindow = (id: WindowId) => {
    setWindows((previousWindows) =>
      previousWindows.map((windowItem) =>
        windowItem.id === id ? { ...windowItem, isOpen: false, isMinimized: false } : windowItem,
      ),
    );
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((previousWindows) =>
      previousWindows.map((windowItem) =>
        windowItem.id === id && windowItem.isOpen ? { ...windowItem, isMinimized: true } : windowItem,
      ),
    );
  };

  const toggleMaximizeWindow = (id: WindowId) => {
    const { maxWidth, maxHeight } = getDesktopBounds();

    setWindows((previousWindows) => {
      const nextZ = Math.max(0, ...previousWindows.map((windowItem) => windowItem.zIndex)) + 1;
      return previousWindows.map((windowItem) => {
        if (windowItem.id !== id) {
          return windowItem;
        }

        if (windowItem.isMaximized && windowItem.restoreBounds) {
          return {
            ...windowItem,
            ...windowItem.restoreBounds,
            isMaximized: false,
            zIndex: nextZ,
          };
        }

        return {
          ...windowItem,
          restoreBounds: {
            x: windowItem.x,
            y: windowItem.y,
            width: windowItem.width,
            height: windowItem.height,
          },
          isMaximized: true,
          x: DESKTOP_PADDING,
          y: DESKTOP_PADDING,
          width: maxWidth,
          height: maxHeight,
          zIndex: nextZ,
        };
      });
    });
  };

  const activateBrowserTab = (tabId: string) => {
    setBrowserState((previousState) => {
      const tab = previousState.tabs.find((item) => item.id === tabId);
      if (!tab) {
        return previousState;
      }

      return {
        ...previousState,
        activeTabId: tabId,
        address: getCurrentTabUrl(tab),
      };
    });
  };

  const openInBrowser = (
    rawUrl: string,
    options?: {
      title?: string;
      mode?: BrowserTabMode;
    },
  ) => {
    const targetUrl = normalizeUrl(rawUrl);
    const targetMode = options?.mode ?? (targetUrl.toLowerCase().endsWith(".pdf") ? "pdf" : "web");
    const targetTitle = options?.title ?? (targetMode === "pdf" ? "Document.pdf" : getUrlTabTitle(targetUrl));
    const isVideoLink = (() => {
      try {
        const parsed = new URL(targetUrl);
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
    })();

    if (targetMode === "web" && isVideoLink) {
      setBrowserDisplayMode("embed");
    }

    setBrowserState((previousState) => {
      const existingTab = previousState.tabs.find(
        (tab) => tab.mode === targetMode && getCurrentTabUrl(tab) === targetUrl,
      );

      if (existingTab) {
        return {
          ...previousState,
          activeTabId: existingTab.id,
          address: targetUrl,
        };
      }

      const nextTabId = `tab-${previousState.nextTabNumber}`;
      const nextTab: BrowserTab = {
        id: nextTabId,
        title: targetTitle,
        mode: targetMode,
        history: [targetUrl],
        index: 0,
      };

      return {
        ...previousState,
        tabs: [...previousState.tabs, nextTab],
        activeTabId: nextTabId,
        address: targetUrl,
        nextTabNumber: previousState.nextTabNumber + 1,
      };
    });

    openWindow("browser");
  };

  const navigateBrowser = (rawUrl: string) => {
    const targetUrl = normalizeUrl(rawUrl);
    const targetMode: BrowserTabMode = targetUrl.toLowerCase().endsWith(".pdf") ? "pdf" : "web";

    setBrowserState((previousState) => {
      const activeIndex = previousState.tabs.findIndex((tab) => tab.id === previousState.activeTabId);
      if (activeIndex < 0) {
        return previousState;
      }

      const activeTab = previousState.tabs[activeIndex];
      const currentUrl = getCurrentTabUrl(activeTab);
      if (currentUrl === targetUrl) {
        return {
          ...previousState,
          address: targetUrl,
        };
      }

      const nextHistory = activeTab.history.slice(0, activeTab.index + 1);
      nextHistory.push(targetUrl);
      const nextTitle = targetMode === "pdf" ? activeTab.title : getUrlTabTitle(targetUrl);

      const updatedTab: BrowserTab = {
        ...activeTab,
        mode: targetMode,
        title: nextTitle,
        history: nextHistory,
        index: nextHistory.length - 1,
      };

      const nextTabs = [...previousState.tabs];
      nextTabs[activeIndex] = updatedTab;

      return {
        ...previousState,
        tabs: nextTabs,
        address: targetUrl,
      };
    });
  };

  const closeBrowserTab = (tabId: string) => {
    setBrowserState((previousState) => {
      if (previousState.tabs.length <= 1) {
        return previousState;
      }

      const tabIndex = previousState.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex < 0) {
        return previousState;
      }

      const nextTabs = previousState.tabs.filter((tab) => tab.id !== tabId);
      const fallbackTab = nextTabs[Math.max(0, tabIndex - 1)] ?? nextTabs[0];
      const nextActiveId = previousState.activeTabId === tabId ? fallbackTab.id : previousState.activeTabId;
      const nextActiveTab = nextTabs.find((tab) => tab.id === nextActiveId) ?? nextTabs[0];

      return {
        ...previousState,
        tabs: nextTabs,
        activeTabId: nextActiveId,
        address: getCurrentTabUrl(nextActiveTab),
      };
    });
  };

  const goBrowserBack = () => {
    setBrowserState((previousState) => {
      const activeIndex = previousState.tabs.findIndex((tab) => tab.id === previousState.activeTabId);
      if (activeIndex < 0) {
        return previousState;
      }

      const activeTab = previousState.tabs[activeIndex];
      if (activeTab.index <= 0) {
        return previousState;
      }

      const updatedTab = {
        ...activeTab,
        index: activeTab.index - 1,
      };

      const nextTabs = [...previousState.tabs];
      nextTabs[activeIndex] = updatedTab;

      return {
        ...previousState,
        tabs: nextTabs,
        address: getCurrentTabUrl(updatedTab),
      };
    });
  };

  const goBrowserForward = () => {
    setBrowserState((previousState) => {
      const activeIndex = previousState.tabs.findIndex((tab) => tab.id === previousState.activeTabId);
      if (activeIndex < 0) {
        return previousState;
      }

      const activeTab = previousState.tabs[activeIndex];
      if (activeTab.index >= activeTab.history.length - 1) {
        return previousState;
      }

      const updatedTab = {
        ...activeTab,
        index: activeTab.index + 1,
      };

      const nextTabs = [...previousState.tabs];
      nextTabs[activeIndex] = updatedTab;

      return {
        ...previousState,
        tabs: nextTabs,
        address: getCurrentTabUrl(updatedTab),
      };
    });
  };

  const goBrowserHome = () => {
    openInBrowser(BROWSER_HOME_URL, { title: "Home", mode: "web" });
  };

  const sendEmailFromSite = () => {
    const subject = encodeURIComponent(emailSubject.trim());
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${portfolioConfig.contactEmail.address}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const goToPreviousArtSlide = () => {
    setArtSlideIndex((previousIndex) => {
      const imageCount = artImageUrls.length;
      if (imageCount <= 1) {
        return 0;
      }
      return previousIndex <= 0 ? imageCount - 1 : previousIndex - 1;
    });
  };

  const goToNextArtSlide = () => {
    setArtSlideIndex((previousIndex) => {
      const imageCount = artImageUrls.length;
      if (imageCount <= 1) {
        return 0;
      }
      return previousIndex >= imageCount - 1 ? 0 : previousIndex + 1;
    });
  };

  const openArtSlideInBrowser = (index: number) => {
    if (artImageUrls.length === 0) {
      return;
    }

    const imageCount = artImageUrls.length;
    const normalizedIndex = ((index % imageCount) + imageCount) % imageCount;
    const imageUrl = artImageUrls[normalizedIndex];
    openInBrowser(imageUrl, { title: getFileLabelFromUrl(imageUrl) });
  };

  const openArtSlideExternally = (index: number) => {
    if (artImageUrls.length === 0) {
      return;
    }

    const imageCount = artImageUrls.length;
    const normalizedIndex = ((index % imageCount) + imageCount) % imageCount;
    const imageUrl = artImageUrls[normalizedIndex];
    openExternalLink(imageUrl);
  };

  const openAppShortcut = (id: WindowId) => {
    closeStartMenu();

    if (id === "linkedin") {
      openExternalLink(portfolioConfig.linkedin.url);
      return;
    }

    const liveLink = LIVE_LINK_APPS[id];
    if (liveLink) {
      openInBrowser(liveLink.url, { title: liveLink.title, mode: liveLink.mode });
      return;
    }

    openWindow(id);
  };

  const handleTaskbarClick = (id: WindowId) => {
    const targetWindow = windows.find((windowItem) => windowItem.id === id);
    if (!targetWindow) {
      return;
    }

    if (targetWindow.isOpen && !targetWindow.isMinimized && topWindowId === id) {
      minimizeWindow(id);
      return;
    }

    openWindow(id);
  };

  const handleTitleMouseDown = (event: ReactMouseEvent<HTMLDivElement>, id: WindowId) => {
    event.preventDefault();
    const draggedWindow = windows.find((windowItem) => windowItem.id === id);
    if (!draggedWindow || draggedWindow.isMaximized) {
      return;
    }

    focusWindow(id);
    dragState.current = {
      id,
      offsetX: event.clientX - draggedWindow.x,
      offsetY: event.clientY - draggedWindow.y,
      width: draggedWindow.width,
      height: draggedWindow.height,
    };
  };

  const handleDesktopIconMouseDown = (
    event: ReactMouseEvent<HTMLButtonElement>,
    id: WindowId,
    iconPixel: { x: number; y: number },
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    setSelectedDesktopIcon(id);

    iconDragState.current = {
      id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      offsetX: event.clientX - iconPixel.x,
      offsetY: event.clientY - iconPixel.y,
      fromCell: iconCells[id],
      moved: false,
    };
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const syncViewportMode = () => setIsMobileViewport(mediaQuery.matches);

    syncViewportMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewportMode);
      return () => {
        mediaQuery.removeEventListener("change", syncViewportMode);
      };
    }

    mediaQuery.addListener(syncViewportMode);
    return () => {
      mediaQuery.removeListener(syncViewportMode);
    };
  }, []);

  useEffect(() => {
    const updateTaskbarHeight = () => {
      const measuredHeight = taskbarRef.current?.offsetHeight ?? TASKBAR_DEFAULT_HEIGHT;
      setTaskbarHeight(measuredHeight);
    };

    updateTaskbarHeight();
    window.addEventListener("resize", updateTaskbarHeight);

    const observer =
      typeof ResizeObserver !== "undefined" && taskbarRef.current
        ? new ResizeObserver(updateTaskbarHeight)
        : null;

    if (observer && taskbarRef.current) {
      observer.observe(taskbarRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateTaskbarHeight);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (hasCenteredAboutWindow.current) {
      return;
    }

    hasCenteredAboutWindow.current = true;
    const { maxWidth, maxHeight } = getDesktopBounds();

    setWindows((previousWindows) => {
      const aboutWindow = previousWindows.find((windowItem) => windowItem.id === "profile");
      if (!aboutWindow) {
        return previousWindows;
      }

      const effectiveWidth = Math.min(aboutWindow.width, maxWidth);
      const effectiveHeight = Math.min(aboutWindow.height, maxHeight);
      const maxX = Math.max(DESKTOP_PADDING, window.innerWidth - effectiveWidth - DESKTOP_PADDING);
      const maxY = Math.max(DESKTOP_PADDING, window.innerHeight - taskbarHeight - effectiveHeight - DESKTOP_PADDING);
      const centeredX = clamp(Math.round((window.innerWidth - effectiveWidth) / 2), DESKTOP_PADDING, maxX);
      const centeredY = clamp(
        Math.round((window.innerHeight - taskbarHeight - effectiveHeight) / 2),
        DESKTOP_PADDING,
        maxY,
      );
      const nextZ = Math.max(0, ...previousWindows.map((windowItem) => windowItem.zIndex)) + 1;

      return previousWindows.map((windowItem) =>
        windowItem.id === "profile"
          ? {
              ...windowItem,
              x: centeredX,
              y: centeredY,
              width: effectiveWidth,
              height: effectiveHeight,
              zIndex: nextZ,
              isOpen: true,
              isMinimized: false,
            }
          : windowItem,
      );
    });
  }, [getDesktopBounds, taskbarHeight]);

  useEffect(() => {
    let isCancelled = false;

    const loadArtGallery = async () => {
      setIsLoadingArtImages(true);
      setArtGalleryError(null);
      try {
        const response = await fetch("/api/art-gallery", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Art gallery request failed (${response.status})`);
        }

        const payload: { images?: string[] } = await response.json();
        if (isCancelled) {
          return;
        }

        setArtImageUrls(Array.isArray(payload.images) ? payload.images : []);
      } catch {
        if (isCancelled) {
          return;
        }
        setArtImageUrls([]);
        setArtGalleryError("Could not load the gallery right now.");
      } finally {
        if (!isCancelled) {
          setIsLoadingArtImages(false);
        }
      }
    };

    loadArtGallery();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setArtSlideIndex((previousIndex) => {
      if (artImageUrls.length === 0) {
        return 0;
      }
      return previousIndex >= artImageUrls.length ? 0 : previousIndex;
    });
  }, [artImageUrls]);

  useEffect(() => {
    const moveWindow = (event: MouseEvent) => {
      if (!dragState.current) {
        return;
      }

      const { id, offsetX, offsetY, width, height } = dragState.current;
      const maxWidth = Math.min(width, window.innerWidth - DESKTOP_PADDING * 2);
      const maxHeight = Math.min(height, window.innerHeight - taskbarHeight - DESKTOP_PADDING * 2);

      const maxX = Math.max(DESKTOP_PADDING, window.innerWidth - maxWidth - DESKTOP_PADDING);
      const maxY = Math.max(
        DESKTOP_PADDING,
        window.innerHeight - taskbarHeight - maxHeight - DESKTOP_PADDING,
      );

      const nextX = clamp(event.clientX - offsetX, DESKTOP_PADDING, maxX);
      const nextY = clamp(event.clientY - offsetY, DESKTOP_PADDING, maxY);

      setWindows((previousWindows) =>
        previousWindows.map((windowItem) =>
          windowItem.id === id ? { ...windowItem, x: nextX, y: nextY } : windowItem,
        ),
      );
    };

    const stopDraggingWindow = () => {
      dragState.current = null;
    };

    window.addEventListener("mousemove", moveWindow);
    window.addEventListener("mouseup", stopDraggingWindow);

    return () => {
      window.removeEventListener("mousemove", moveWindow);
      window.removeEventListener("mouseup", stopDraggingWindow);
    };
  }, [taskbarHeight]);

  useEffect(() => {
    const moveDesktopIcon = (event: MouseEvent) => {
      if (!iconDragState.current) {
        return;
      }

      const dragContext = iconDragState.current;
      const distance =
        Math.abs(event.clientX - dragContext.startPointerX) +
        Math.abs(event.clientY - dragContext.startPointerY);

      if (!dragContext.moved && distance < 4) {
        return;
      }

      dragContext.moved = true;
      suppressIconClick.current = true;

      const { maxX, maxY } = getIconGridLimits();
      const nextX = clamp(event.clientX - dragContext.offsetX, DESKTOP_PADDING, maxX);
      const nextY = clamp(event.clientY - dragContext.offsetY, DESKTOP_PADDING, maxY);
      setDraggingIcon({
        id: dragContext.id,
        x: nextX,
        y: nextY,
      });
    };

    const stopDraggingDesktopIcon = () => {
      if (!iconDragState.current) {
        return;
      }

      const dragContext = iconDragState.current;

      if (dragContext.moved) {
        const dropPixel = draggingIcon
          ? { x: draggingIcon.x, y: draggingIcon.y }
          : cellToPixel(dragContext.fromCell);
        const { maxCol, maxRow } = getIconGridLimits();

        const targetCell = clampCell(
          {
            col: Math.round((dropPixel.x - DESKTOP_PADDING) / ICON_CELL_WIDTH),
            row: Math.round((dropPixel.y - DESKTOP_PADDING) / ICON_CELL_HEIGHT),
          },
          maxCol,
          maxRow,
        );

        setIconCells((previousCells) => {
          const nextCells = { ...previousCells };
          const swappedId = ICON_ORDER.find(
            (iconId) =>
              iconId !== dragContext.id &&
              previousCells[iconId].col === targetCell.col &&
              previousCells[iconId].row === targetCell.row,
          );

          nextCells[dragContext.id] = targetCell;
          if (swappedId) {
            nextCells[swappedId] = dragContext.fromCell;
          }

          return normalizeIconCells(nextCells, maxCol, maxRow);
        });
      }

      iconDragState.current = null;
      setDraggingIcon(null);
      window.setTimeout(() => {
        suppressIconClick.current = false;
      }, 0);
    };

    window.addEventListener("mousemove", moveDesktopIcon);
    window.addEventListener("mouseup", stopDraggingDesktopIcon);

    return () => {
      window.removeEventListener("mousemove", moveDesktopIcon);
      window.removeEventListener("mouseup", stopDraggingDesktopIcon);
    };
  }, [cellToPixel, draggingIcon, getIconGridLimits]);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => {
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    const keepWindowsInBounds = () => {
      const { maxWidth, maxHeight } = getDesktopBounds();

      setWindows((previousWindows) =>
        previousWindows.map((windowItem) => {
          if (windowItem.isMaximized) {
            return {
              ...windowItem,
              x: DESKTOP_PADDING,
              y: DESKTOP_PADDING,
              width: maxWidth,
              height: maxHeight,
            };
          }

          const effectiveWidth = Math.min(windowItem.width, maxWidth);
          const effectiveHeight = Math.min(windowItem.height, maxHeight);
          const maxX = Math.max(DESKTOP_PADDING, window.innerWidth - effectiveWidth - DESKTOP_PADDING);
          const maxY = Math.max(
            DESKTOP_PADDING,
            window.innerHeight - taskbarHeight - effectiveHeight - DESKTOP_PADDING,
          );

          return {
            ...windowItem,
            width: effectiveWidth,
            height: effectiveHeight,
            x: clamp(windowItem.x, DESKTOP_PADDING, maxX),
            y: clamp(windowItem.y, DESKTOP_PADDING, maxY),
          };
        }),
      );
    };

    keepWindowsInBounds();
    window.addEventListener("resize", keepWindowsInBounds);

    return () => {
      window.removeEventListener("resize", keepWindowsInBounds);
    };
  }, [getDesktopBounds, taskbarHeight]);

  useEffect(() => {
    const clampIconsToViewport = () => {
      const { maxCol, maxRow } = getIconGridLimits();
      setIconCells((previousCells) => normalizeIconCells(previousCells, maxCol, maxRow));
    };

    clampIconsToViewport();
    window.addEventListener("resize", clampIconsToViewport);

    return () => {
      window.removeEventListener("resize", clampIconsToViewport);
    };
  }, [getIconGridLimits, taskbarHeight]);

  useEffect(() => {
    const closeStartMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStartMenuOpen(false);
        setActiveStartSubmenu(null);
      }
    };

    window.addEventListener("keydown", closeStartMenuOnEscape);
    return () => {
      window.removeEventListener("keydown", closeStartMenuOnEscape);
    };
  }, []);

  const renderWindowBody = (id: WindowId) => {
    if (id === "profile") {
      return <AboutContent aboutTab={aboutTab} setAboutTab={setAboutTab} />;
    }

    if (id === "resume") {
      return (
        <>
          <h2 className="section-title">{portfolioConfig.pages.resume}</h2>
          <p>{portfolioConfig.resume.description}</p>
          <div className="folder-view">
            <button
              type="button"
              className="folder-shortcut"
              onDoubleClick={() =>
                openInBrowser(portfolioConfig.resume.url, {
                  title: portfolioConfig.pages.resume,
                  mode: "pdf",
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openInBrowser(portfolioConfig.resume.url, {
                    title: portfolioConfig.pages.resume,
                    mode: "pdf",
                  });
                }
              }}
            >
              <WindowIcon id="resume" variant="32x32_4" className="folder-shortcut-icon" />
              <span className="folder-shortcut-label">{`${portfolioConfig.pages.resume}.pdf`}</span>
            </button>
          </div>
          <p className="folder-hint">Double-click the file to open it in the embedded browser tab.</p>
        </>
      );
    }

    if (id === "linkedin") {
      return (
        <>
          <h2 className="section-title">{portfolioConfig.pages.linkedin}</h2>
          <p>{portfolioConfig.linkedin.description}</p>
          <div className="folder-view">
            <button
              type="button"
              className="folder-shortcut"
              onDoubleClick={() => openExternalLink(portfolioConfig.linkedin.url)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openExternalLink(portfolioConfig.linkedin.url);
                }
              }}
            >
              <WindowIcon id="linkedin" variant="32x32_4" className="folder-shortcut-icon" />
              <span className="folder-shortcut-label">{portfolioConfig.pages.linkedin}</span>
            </button>
          </div>
          <p className="folder-hint">Double-click to open this page directly in a new browser tab.</p>
        </>
      );
    }

    if (id === "projects") {
      return (
        <div className="projects-shell98">
          <h2 className="section-title">{portfolioConfig.pages.projects}</h2>
          {portfolioConfig.currentProjects.length > 0 ? (
            <div className="folder-view folder-project-grid project-folder-view">
              {portfolioConfig.currentProjects.map((project) => {
                const projectUrl = project.url?.trim() ?? "";
                const hasProjectLink = projectUrl.length > 0;
                const projectDescription = project.description.trim();
                const noLinkTextUrl = createTextDocumentDataUrl(
                  `${project.name}.txt`,
                  `${project.name}\n\n${
                    projectDescription || "No external link is available for this project yet."
                  }`,
                );
                const targetUrl = hasProjectLink ? projectUrl : noLinkTextUrl;
                const targetTitle = hasProjectLink ? project.name : `${project.name}.txt`;

                return (
                  <div key={project.name} className="folder-project-item">
                    <button
                      type="button"
                      className="folder-shortcut"
                      onDoubleClick={() =>
                        openInBrowser(targetUrl, {
                          title: targetTitle,
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          openInBrowser(targetUrl, {
                            title: targetTitle,
                          });
                        }
                      }}
                    >
                      <Explorer100 variant="32x32_4" className="folder-shortcut-icon" aria-hidden />
                      <span className="folder-shortcut-label">{hasProjectLink ? project.name : `${project.name}.txt`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="folder-view project-folder-view">
              <p>Add items to `currentProjects` in `app/portfolio.config.ts` to populate this list.</p>
            </div>
          )}
          <p className="folder-hint project-folder-hint">
            Double-click a project file to open it in browser tabs. Projects without links open as text files.
          </p>
        </div>
      );
    }

    if (id === "email") {
      return (
        <>
          <h2 className="section-title">{portfolioConfig.pages.email}</h2>
          <p>{portfolioConfig.contactEmail.description}</p>
          <p className="section-subtitle">{portfolioConfig.contactEmail.address}</p>
          <div className="mail-compose98">
            <label htmlFor="email-subject">Subject</label>
            <input
              id="email-subject"
              className="mail-compose-input"
              type="text"
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
            />
            <label htmlFor="email-body">Message</label>
            <textarea
              id="email-body"
              className="mail-compose-textarea"
              value={emailBody}
              onChange={(event) => setEmailBody(event.target.value)}
            />
          </div>
          <div className="action-row">
            <button type="button" onClick={sendEmailFromSite}>
              Send Email
            </button>
          </div>
        </>
      );
    }

    if (id === "art") {
      return (
        <ArtSlideshowContent
          artImageUrls={artImageUrls}
          artSlideIndex={artSlideIndex}
          isLoadingArtImages={isLoadingArtImages}
          artGalleryError={artGalleryError}
          onPrevious={goToPreviousArtSlide}
          onNext={goToNextArtSlide}
          onOpenImage={openArtSlideInBrowser}
        />
      );
    }

    return (
      <BrowserShellContent
        browserState={browserState}
        activeBrowserTab={activeBrowserTab}
        canBrowserGoBack={canBrowserGoBack}
        canBrowserGoForward={canBrowserGoForward}
        currentBrowserUrl={currentBrowserUrl}
        browserFrameUrl={browserFrameUrl}
        useBrowserCompatibilityMode={useBrowserCompatibilityMode}
        browserDisplayMode={browserDisplayMode}
        browserTitle={portfolioConfig.pages.browser}
        onToggleCompatibility={() => setUseBrowserCompatibilityMode((previousState) => !previousState)}
        onToggleReader={() =>
          setBrowserDisplayMode((previousState) => (previousState === "reader" ? "embed" : "reader"))
        }
        onGoBack={goBrowserBack}
        onGoForward={goBrowserForward}
        onGoHome={goBrowserHome}
        onOpenExternal={openExternalLink}
        onNavigate={navigateBrowser}
        onActivateTab={activateBrowserTab}
        onCloseTab={closeBrowserTab}
        onAddressChange={(value) =>
          setBrowserState((previousState) => ({
            ...previousState,
            address: value,
          }))
        }
      />
    );
  };

  if (isMobileViewport) {
    return (
      <MobilePortfolioContent
        activeSection={activeMobileSection}
        onSectionChange={setActiveMobileSection}
        aboutTab={aboutTab}
        setAboutTab={setAboutTab}
        emailSubject={emailSubject}
        emailBody={emailBody}
        onEmailSubjectChange={setEmailSubject}
        onEmailBodyChange={setEmailBody}
        onSendEmail={sendEmailFromSite}
        onOpenResume={() => openExternalLink(portfolioConfig.resume.url)}
        onOpenLinkedIn={() => openExternalLink(portfolioConfig.linkedin.url)}
        onOpenProjectLink={openExternalLink}
        artImageUrls={artImageUrls}
        artSlideIndex={artSlideIndex}
        isLoadingArtImages={isLoadingArtImages}
        artGalleryError={artGalleryError}
        onPreviousArt={goToPreviousArtSlide}
        onNextArt={goToNextArtSlide}
        onOpenArtImage={openArtSlideExternally}
      />
    );
  }

  const desktopBottomPadding = taskbarHeight + 8;
  const clockLabel = clock.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <main
      className="desktop98"
      style={{ paddingBottom: desktopBottomPadding }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".desktop-icon98")) {
          setSelectedDesktopIcon(null);
        }
        if (!target.closest(".start-menu98") && !target.closest(".start98")) {
          closeStartMenu();
        }
      }}
    >
      <section className="desktop-icons98" aria-label="Desktop shortcuts">
        {ICON_ORDER.map((iconId) => {
          const iconCell = iconCells[iconId];
          const iconPixel =
            draggingIcon && draggingIcon.id === iconId
              ? { x: draggingIcon.x, y: draggingIcon.y }
              : cellToPixel(iconCell);
          const iconLabel = WINDOW_TEMPLATES.find((windowItem) => windowItem.id === iconId)?.title ?? iconId;

          return (
            <button
              key={iconId}
              type="button"
              className={`desktop-icon98 ${selectedDesktopIcon === iconId ? "selected" : ""} ${
                draggingIcon?.id === iconId ? "dragging" : ""
              }`}
              style={{ left: iconPixel.x, top: iconPixel.y }}
              onMouseDown={(event) => handleDesktopIconMouseDown(event, iconId, cellToPixel(iconCell))}
              onClick={(event) => {
                event.stopPropagation();
                if (suppressIconClick.current) {
                  return;
                }
                setSelectedDesktopIcon(iconId);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                openAppShortcut(iconId);
              }}
            >
              <WindowIcon id={iconId} variant="32x32_4" className="desktop-icon-image" />
              <span className="desktop-icon-label">{iconLabel}</span>
            </button>
          );
        })}
      </section>

      {windows
        .filter((windowItem) => windowItem.isOpen && !windowItem.isMinimized)
        .map((windowItem) => (
          <article
            key={windowItem.id}
            className="window draggable-window"
            style={{
              left: windowItem.x,
              top: windowItem.y,
              zIndex: windowItem.zIndex,
              width: `${windowItem.width}px`,
              height: `${windowItem.height}px`,
            }}
            onMouseDown={() => focusWindow(windowItem.id)}
          >
            <div className="title-bar" onMouseDown={(event) => handleTitleMouseDown(event, windowItem.id)}>
              <div className="title-bar-text">
                <WindowIcon id={windowItem.id} variant="16x16_4" className="window-title-icon" />
                <span>{windowItem.title}</span>
              </div>
              <div className="title-bar-controls">
                <button
                  type="button"
                  aria-label="Minimize"
                  title={`Minimize ${windowItem.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    minimizeWindow(windowItem.id);
                  }}
                />
                <button
                  type="button"
                  aria-label={windowItem.isMaximized ? "Restore" : "Maximize"}
                  title={windowItem.isMaximized ? `Restore ${windowItem.title}` : `Maximize ${windowItem.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleMaximizeWindow(windowItem.id);
                  }}
                />
                <button
                  type="button"
                  aria-label="Close"
                  title={`Close ${windowItem.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeWindow(windowItem.id);
                  }}
                />
              </div>
            </div>

            <div className="window-body window-content98">
              <div className={`window-panel98 ${windowItem.id === "browser" ? "browser-panel" : ""}`}>
                {renderWindowBody(windowItem.id)}
              </div>
            </div>

            <div className="status-bar">
              <p className="status-bar-field">{windowItem.statusText}</p>
              <p className="status-bar-field">
                {windowItem.width} x {windowItem.height}
              </p>
            </div>
          </article>
        ))}

      {isStartMenuOpen ? (
        <aside className="window start-menu98" style={{ bottom: taskbarHeight + 4 }}>
          <div className="start-menu-inner">
            <div className="start-menu-side">Windows 95</div>
            <div className="start-menu-items">
              <button
                type="button"
                className="start-menu-item"
                onClick={() => {
                  goBrowserHome();
                  closeStartMenu();
                }}
              >
                <Explorer100 variant="16x16_4" className="taskbar-icon" aria-hidden />
                <span>{portfolioConfig.pages.browser}</span>
              </button>
              <button type="button" className="start-menu-item" onClick={() => openWindow("profile")}>
                <WindowIcon id="profile" variant="16x16_4" className="taskbar-icon" />
                <span>{portfolioConfig.pages.about}</span>
              </button>

              <div
                className="start-menu-parent-wrap"
                onMouseEnter={() => setActiveStartSubmenu("projects")}
                onMouseLeave={() =>
                  setActiveStartSubmenu((previousState) => (previousState === "projects" ? null : previousState))
                }
              >
                <button
                  type="button"
                  className="start-menu-item start-menu-parent"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveStartSubmenu((previousState) => (previousState === "projects" ? null : "projects"));
                  }}
                >
                  <WindowIcon id="projects" variant="16x16_4" className="taskbar-icon" />
                  <span>{portfolioConfig.pages.projects}</span>
                  <span className="start-menu-arrow">▶</span>
                </button>
                {activeStartSubmenu === "projects" ? (
                  <div className="window start-submenu98">
                    {portfolioConfig.currentProjects.length > 0 ? (
                      portfolioConfig.currentProjects.map((project) => (
                        <button
                          key={project.name}
                          type="button"
                          className="start-menu-item"
                          disabled={!project.url}
                          onClick={() => {
                            if (!project.url) {
                              return;
                            }
                            openInBrowser(project.url, { title: project.name });
                            closeStartMenu();
                          }}
                        >
                          <Explorer100 variant="16x16_4" className="taskbar-icon" aria-hidden />
                          <span>{project.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="start-submenu-empty">No projects yet.</div>
                    )}
                  </div>
                ) : null}
              </div>

              <div
                className="start-menu-parent-wrap"
                onMouseEnter={() => setActiveStartSubmenu("links")}
                onMouseLeave={() =>
                  setActiveStartSubmenu((previousState) => (previousState === "links" ? null : previousState))
                }
              >
                <button
                  type="button"
                  className="start-menu-item start-menu-parent"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveStartSubmenu((previousState) => (previousState === "links" ? null : "links"));
                  }}
                >
                  <FolderOpen variant="16x16_4" className="taskbar-icon" aria-hidden />
                  <span>Portfolio Links</span>
                  <span className="start-menu-arrow">▶</span>
                </button>
                {activeStartSubmenu === "links" ? (
                  <div className="window start-submenu98">
                    <button type="button" className="start-menu-item" onClick={() => openAppShortcut("resume")}>
                      <WindowIcon id="resume" variant="16x16_4" className="taskbar-icon" />
                      <span>{portfolioConfig.pages.resume}</span>
                    </button>
                    <button type="button" className="start-menu-item" onClick={() => openAppShortcut("linkedin")}>
                      <WindowIcon id="linkedin" variant="16x16_4" className="taskbar-icon" />
                      <span>{portfolioConfig.pages.linkedin}</span>
                    </button>
                    <button type="button" className="start-menu-item" onClick={() => openAppShortcut("art")}>
                      <WindowIcon id="art" variant="16x16_4" className="taskbar-icon" />
                      <span>{portfolioConfig.pages.art}</span>
                    </button>
                    <button type="button" className="start-menu-item" onClick={() => openWindow("email")}>
                      <WindowIcon id="email" variant="16x16_4" className="taskbar-icon" />
                      <span>{portfolioConfig.pages.email}</span>
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="start-menu-divider" />
              <button
                type="button"
                className="start-menu-item"
                onClick={() => {
                  closeStartMenu();
                  setWindows((previousWindows) =>
                    previousWindows.map((windowItem) => ({
                      ...windowItem,
                      isOpen: false,
                      isMinimized: false,
                    })),
                  );
                }}
              >
                <Mmsys120 variant="16x16_4" className="taskbar-icon" aria-hidden />
                <span>Shut Down...</span>
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <footer className="taskbar98" ref={taskbarRef}>
        <button
          type="button"
          className="start98"
          onClick={(event) => {
            event.stopPropagation();
            setStartMenuOpen((previousState) => {
              const nextState = !previousState;
              if (!nextState) {
                setActiveStartSubmenu(null);
              }
              return nextState;
            });
          }}
        >
          <FlyingWindows100 variant="16x16_4" className="taskbar-icon" aria-hidden />
          <span>Start</span>
        </button>

        <div className="taskbar-separator" />

        <div className="quick-launch98" aria-label="Quick Launch">
          <button
            type="button"
            aria-label="Show desktop"
            title="Show Desktop"
            onClick={() =>
              setWindows((previousWindows) =>
                previousWindows.map((windowItem) => ({
                  ...windowItem,
                  isMinimized: windowItem.isOpen ? true : windowItem.isMinimized,
                })),
              )
            }
          >
            <Desktop variant="16x16_4" className="taskbar-icon" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Open ${portfolioConfig.pages.browser}`}
            title={portfolioConfig.pages.browser}
            onClick={() => goBrowserHome()}
          >
            <Explorer100 variant="16x16_4" className="taskbar-icon" aria-hidden />
          </button>
        </div>

        <div className="taskbar-separator" />

        <div className="task-buttons98">
      {windows
        .filter((windowItem) => windowItem.isOpen && !windowItem.isMinimized)
        .map((windowItem) => (
              <button
                key={windowItem.id}
                type="button"
                className={`task-button98 ${windowItem.isOpen ? "open" : ""} ${
                  topWindowId === windowItem.id ? "active" : ""
                }`}
                onClick={() => handleTaskbarClick(windowItem.id)}
              >
                <WindowIcon id={windowItem.id} variant="16x16_4" className="taskbar-icon" />
                <span>{windowItem.title}</span>
              </button>
            ))}
        </div>

        <div className="taskbar-separator" />

        <div className="tray98">
          <Mmsys120 variant="16x16_4" className="taskbar-icon" aria-hidden />
          <span className="clock-text">{clockLabel}</span>
        </div>
      </footer>
    </main>
  );
}
