import { Computer } from "@react95/icons";
import { portfolioConfig } from "../portfolio.config";

interface AboutContentProps {
  aboutTab: string;
  setAboutTab: (nextTabId: string) => void;
}

export function AboutContent({ aboutTab, setAboutTab }: AboutContentProps) {
  const activeAboutSubtab =
    portfolioConfig.aboutSubtabs.find((subtab) => subtab.id === aboutTab) ?? portfolioConfig.aboutSubtabs[0];

  return (
    <div className="about-shell98">
      <h2 className="section-title">{portfolioConfig.pages.about}</h2>
      <p className="section-subtitle">{portfolioConfig.name}</p>
      <div className="about-tabs98" role="tablist" aria-label="About tabs">
        {portfolioConfig.aboutSubtabs.map((subtab) => (
          <button
            key={subtab.id}
            type="button"
            className={`about-tab98 ${aboutTab === subtab.id ? "active" : ""}`}
            role="tab"
            aria-selected={aboutTab === subtab.id}
            onClick={() => setAboutTab(subtab.id)}
          >
            {subtab.label}
          </button>
        ))}
      </div>

      <section className="about-panel98">
        {activeAboutSubtab ? (
          <div className="about-general98">
            <Computer variant="32x32_4" className="about-general-icon" aria-hidden />
            <div className="about-general-text">
              {activeAboutSubtab.description.map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                  return <div key={`${activeAboutSubtab.id}-${index}-spacer`} className="about-line-gap" aria-hidden />;
                }

                const isHeader = trimmedLine.endsWith(":");
                const isDescription = /^\s{2,}/.test(line);
                const lineClassName = isHeader
                  ? "about-line-header"
                  : isDescription
                    ? "about-line-description"
                    : "about-line-body";

                return (
                  <p key={`${activeAboutSubtab.id}-${index}-${trimmedLine}`} className={lineClassName}>
                    {trimmedLine}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <p>Add `aboutSubtabs` in `app/portfolio.config.ts` to populate this section.</p>
        )}
      </section>
    </div>
  );
}
