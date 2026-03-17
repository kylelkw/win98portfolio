import type { BrowserDisplayMode, BrowserState, BrowserTab } from "../desktop-core";

interface BrowserShellContentProps {
  browserState: BrowserState;
  activeBrowserTab?: BrowserTab;
  canBrowserGoBack: boolean;
  canBrowserGoForward: boolean;
  currentBrowserUrl: string;
  browserFrameUrl: string;
  useBrowserCompatibilityMode: boolean;
  browserDisplayMode: BrowserDisplayMode;
  browserTitle: string;
  onToggleCompatibility: () => void;
  onToggleReader: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onOpenExternal: (url: string) => void;
  onNavigate: (url: string) => void;
  onActivateTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onAddressChange: (value: string) => void;
}

export function BrowserShellContent({
  browserState,
  activeBrowserTab,
  canBrowserGoBack,
  canBrowserGoForward,
  currentBrowserUrl,
  browserFrameUrl,
  useBrowserCompatibilityMode,
  browserDisplayMode,
  browserTitle,
  onToggleCompatibility,
  onToggleReader,
  onGoBack,
  onGoForward,
  onGoHome,
  onOpenExternal,
  onNavigate,
  onActivateTab,
  onCloseTab,
  onAddressChange,
}: BrowserShellContentProps) {
  return (
    <div className="browser-shell">
      <div className="browser-tabs" role="tablist" aria-label="Browser tabs">
        {browserState.tabs.map((tab) => {
          const isActive = tab.id === activeBrowserTab?.id;
          return (
            <div key={tab.id} className={`browser-tab-item ${isActive ? "active" : ""}`}>
              <button
                type="button"
                className="browser-tab-button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onActivateTab(tab.id)}
              >
                {tab.title}
              </button>
              {browserState.tabs.length > 1 ? (
                <button
                  type="button"
                  className="browser-tab-close"
                  aria-label={`Close ${tab.title}`}
                  onClick={() => onCloseTab(tab.id)}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="browser-toolbar">
        <div className="browser-nav-row">
          <button type="button" onClick={onGoBack} disabled={!canBrowserGoBack}>
            Back
          </button>
          <button type="button" onClick={onGoForward} disabled={!canBrowserGoForward}>
            Forward
          </button>
          <button type="button" onClick={onGoHome}>
            Home
          </button>
          <button
            type="button"
            onClick={onToggleCompatibility}
            disabled={activeBrowserTab?.mode === "pdf"}
            title="Compatibility mode routes websites through a local embed proxy."
          >
            Compat: {useBrowserCompatibilityMode ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={onToggleReader}
            disabled={activeBrowserTab?.mode === "pdf"}
            title="Reader mode extracts text content for sites that block embedding."
          >
            Reader: {browserDisplayMode === "reader" ? "On" : "Off"}
          </button>
          <button type="button" onClick={() => onOpenExternal(currentBrowserUrl)}>
            Open External
          </button>
        </div>

        <form
          className="browser-address-row"
          onSubmit={(event) => {
            event.preventDefault();
            onNavigate(browserState.address);
          }}
        >
          <label htmlFor="browser-address">Address</label>
          <input
            id="browser-address"
            className="browser-address-input"
            type="text"
            value={browserState.address}
            onChange={(event) => onAddressChange(event.target.value)}
          />
          <button type="submit">Go</button>
        </form>
      </div>

      <div className="browser-view">
        {activeBrowserTab?.mode === "pdf" ? (
          <iframe
            className="browser-pdf"
            src={browserFrameUrl}
            title={`${browserTitle} PDF preview`}
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <iframe
            className="browser-frame"
            src={browserFrameUrl}
            title={browserTitle}
            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>

      <p className="browser-note">
        If page does not load, please{" "}
        {currentBrowserUrl !== "about:blank" ? (
          <a href={currentBrowserUrl} target="_blank" rel="noopener noreferrer">
            click here
          </a>
        ) : (
          "click here"
        )}
        {" "}to view directly. You can also toggle Compat or Reader mode.
      </p>
    </div>
  );
}
