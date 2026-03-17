"use client";

import { Explorer100 } from "@react95/icons";
import { useMemo, useState } from "react";
import type { WindowId } from "../desktop-core";
import { portfolioConfig, type CurrentProject } from "../portfolio.config";
import { AboutContent } from "./about-content";
import { ArtSlideshowContent } from "./art-slideshow-content";
import { WindowIcon } from "./window-icon";

export type MobileSectionId = "about" | "projects" | "art" | "resume" | "linkedin" | "email";

const MOBILE_SECTIONS: Array<{ id: MobileSectionId; label: string; iconId: WindowId }> = [
  { id: "about", label: portfolioConfig.pages.about, iconId: "profile" },
  { id: "projects", label: portfolioConfig.pages.projects, iconId: "projects" },
  { id: "art", label: portfolioConfig.pages.art, iconId: "art" },
  { id: "resume", label: portfolioConfig.pages.resume, iconId: "resume" },
  { id: "linkedin", label: portfolioConfig.pages.linkedin, iconId: "linkedin" },
  { id: "email", label: portfolioConfig.pages.email, iconId: "email" },
];

interface MobilePortfolioContentProps {
  activeSection: MobileSectionId;
  onSectionChange: (nextSection: MobileSectionId) => void;
  aboutTab: string;
  setAboutTab: (nextTabId: string) => void;
  emailSubject: string;
  emailBody: string;
  onEmailSubjectChange: (value: string) => void;
  onEmailBodyChange: (value: string) => void;
  onSendEmail: () => void;
  onOpenResume: () => void;
  onOpenLinkedIn: () => void;
  onOpenProjectLink: (url: string) => void;
  artImageUrls: string[];
  artSlideIndex: number;
  isLoadingArtImages: boolean;
  artGalleryError: string | null;
  onPreviousArt: () => void;
  onNextArt: () => void;
  onOpenArtImage: (index: number) => void;
}

export function MobilePortfolioContent({
  activeSection,
  onSectionChange,
  aboutTab,
  setAboutTab,
  emailSubject,
  emailBody,
  onEmailSubjectChange,
  onEmailBodyChange,
  onSendEmail,
  onOpenResume,
  onOpenLinkedIn,
  onOpenProjectLink,
  artImageUrls,
  artSlideIndex,
  isLoadingArtImages,
  artGalleryError,
  onPreviousArt,
  onNextArt,
  onOpenArtImage,
}: MobilePortfolioContentProps) {
  const [selectedProjectNote, setSelectedProjectNote] = useState<CurrentProject | null>(null);

  const activeSectionMeta = useMemo(
    () => MOBILE_SECTIONS.find((section) => section.id === activeSection) ?? MOBILE_SECTIONS[0],
    [activeSection],
  );

  const renderSectionBody = () => {
    if (activeSection === "about") {
      return <AboutContent aboutTab={aboutTab} setAboutTab={setAboutTab} />;
    }

    if (activeSection === "projects") {
      return (
        <div className="mobile-section-content">
          <h2 className="section-title">{portfolioConfig.pages.projects}</h2>
          <p>Select a project to open it. Projects without a link open as a text note below.</p>
          <div className="mobile-project-list">
            {portfolioConfig.currentProjects.map((project) => {
              const projectUrl = project.url?.trim() ?? "";
              const hasLink = projectUrl.length > 0;
              return (
                <button
                  key={project.name}
                  type="button"
                  className="mobile-project-item"
                  onClick={() => {
                    if (hasLink) {
                      setSelectedProjectNote(null);
                      onOpenProjectLink(projectUrl);
                      return;
                    }
                    setSelectedProjectNote(project);
                  }}
                >
                  <Explorer100 variant="16x16_4" className="taskbar-icon" aria-hidden />
                  <span>{hasLink ? project.name : `${project.name}.txt`}</span>
                </button>
              );
            })}
          </div>

          {selectedProjectNote ? (
            <div className="mobile-project-note">
              <p className="section-subtitle">{`${selectedProjectNote.name}.txt`}</p>
              <pre>{selectedProjectNote.description.trim() || "No external link is available for this project yet."}</pre>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeSection === "art") {
      return (
        <ArtSlideshowContent
          artImageUrls={artImageUrls}
          artSlideIndex={artSlideIndex}
          isLoadingArtImages={isLoadingArtImages}
          artGalleryError={artGalleryError}
          isMobile
          onPrevious={onPreviousArt}
          onNext={onNextArt}
          onOpenImage={onOpenArtImage}
        />
      );
    }

    if (activeSection === "resume") {
      return (
        <div className="mobile-section-content">
          <h2 className="section-title">{portfolioConfig.pages.resume}</h2>
          <p>{portfolioConfig.resume.description}</p>
          <div className="mobile-action-row">
            <button type="button" onClick={onOpenResume}>
              Open Resume
            </button>
          </div>
        </div>
      );
    }

    if (activeSection === "linkedin") {
      return (
        <div className="mobile-section-content">
          <h2 className="section-title">{portfolioConfig.pages.linkedin}</h2>
          <p>{portfolioConfig.linkedin.description}</p>
          <div className="mobile-action-row">
            <button type="button" onClick={onOpenLinkedIn}>
              Open LinkedIn
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mobile-section-content">
        <h2 className="section-title">{portfolioConfig.pages.email}</h2>
        <p>{portfolioConfig.contactEmail.description}</p>
        <p className="section-subtitle">{portfolioConfig.contactEmail.address}</p>
        <div className="mail-compose98">
          <label htmlFor="mobile-email-subject">Subject</label>
          <input
            id="mobile-email-subject"
            className="mail-compose-input"
            type="text"
            value={emailSubject}
            onChange={(event) => onEmailSubjectChange(event.target.value)}
          />
          <label htmlFor="mobile-email-body">Message</label>
          <textarea
            id="mobile-email-body"
            className="mail-compose-textarea"
            value={emailBody}
            onChange={(event) => onEmailBodyChange(event.target.value)}
          />
        </div>
        <div className="mobile-action-row">
          <button type="button" onClick={onSendEmail}>
            Send Email
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="mobile98">
      <header className="mobile98-header">
        <h1 className="mobile98-title">{portfolioConfig.name}</h1>
        <p className="mobile98-subtitle">{portfolioConfig.headline}</p>
      </header>

      <section className="window mobile98-window">
        <div className="title-bar">
          <div className="title-bar-text">
            <WindowIcon id={activeSectionMeta.iconId} variant="16x16_4" className="window-title-icon" />
            <span>{activeSectionMeta.label}</span>
          </div>
        </div>
        <div className="window-body mobile98-window-body">{renderSectionBody()}</div>
      </section>

      <nav className="mobile98-nav" aria-label="Mobile section navigation">
        {MOBILE_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`mobile98-nav-button ${activeSection === section.id ? "active" : ""}`}
            onClick={() => onSectionChange(section.id)}
          >
            <WindowIcon id={section.iconId} variant="16x16_4" className="taskbar-icon" />
            <span className="mobile98-nav-label">{section.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
