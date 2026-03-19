import Image from "next/image";
import { useRef, type TouchEvent } from "react";
import { portfolioConfig } from "../portfolio.config";
import { getFileLabelFromUrl } from "../desktop-core";

interface ArtSlideshowContentProps {
  artImageUrls: string[];
  artSlideIndex: number;
  isLoadingArtImages: boolean;
  artGalleryError: string | null;
  isMobile?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenImage: (index: number) => void;
}

export function ArtSlideshowContent({
  artImageUrls,
  artSlideIndex,
  isLoadingArtImages,
  artGalleryError,
  isMobile = false,
  onPrevious,
  onNext,
  onOpenImage,
}: ArtSlideshowContentProps) {
  const imageCount = artImageUrls.length;
  const hasMultipleImages = imageCount > 1;
  const normalizedIndex = imageCount > 0 ? ((artSlideIndex % imageCount) + imageCount) % imageCount : 0;
  const currentImageUrl = imageCount > 0 ? artImageUrls[normalizedIndex] : "";
  const previousImageUrl = imageCount > 0 ? artImageUrls[(normalizedIndex - 1 + imageCount) % imageCount] : "";
  const nextImageUrl = imageCount > 0 ? artImageUrls[(normalizedIndex + 1) % imageCount] : "";
  const currentImageLabel = currentImageUrl ? getFileLabelFromUrl(currentImageUrl) : "";
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    if (!hasMultipleImages) {
      return;
    }
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    if (!hasMultipleImages || touchStartXRef.current === null) {
      touchStartXRef.current = null;
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 28) {
      return;
    }

    if (deltaX < 0) {
      onNext();
    } else {
      onPrevious();
    }
  };

  return (
    <div className="art-gallery-shell">
      <h2 className="section-title">{portfolioConfig.pages.art}</h2>
      <p>{portfolioConfig.artPortfolio.description}</p>
      <div className="art-gallery-pane">
        {isLoadingArtImages ? <p className="art-gallery-state">Loading gallery images...</p> : null}
        {!isLoadingArtImages && artGalleryError ? <p className="art-gallery-state">{artGalleryError}</p> : null}
        {!isLoadingArtImages && !artGalleryError && artImageUrls.length === 0 ? (
          <p className="art-gallery-state">
            Add image files to <code>public\art-gallery</code> and refresh to populate this gallery.
          </p>
        ) : null}
        {!isLoadingArtImages && !artGalleryError && artImageUrls.length > 0 ? (
          isMobile ? (
            <div className="art-slideshow98-mobile">
              <button
                type="button"
                className="art-mobile-main-preview"
                onClick={() => onOpenImage(normalizedIndex)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-label="Open current art image"
              >
                <span className="art-main-thumb-wrap art-mobile-main-thumb-wrap">
                  <Image
                    src={currentImageUrl}
                    alt={currentImageLabel}
                    fill
                    sizes="(max-width: 860px) 92vw, 40vw"
                    className="art-main-thumb"
                  />
                </span>
                <span className="art-gallery-caption art-main-caption">{currentImageLabel}</span>
              </button>
              <div className="art-mobile-controls">
                <button
                  type="button"
                  className="art-mobile-nav-button"
                  onClick={onPrevious}
                  disabled={!hasMultipleImages}
                >
                  Previous
                </button>
                <span className="art-mobile-index">
                  {normalizedIndex + 1} / {imageCount}
                </span>
                <button type="button" className="art-mobile-nav-button" onClick={onNext} disabled={!hasMultipleImages}>
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="art-slideshow98">
              <button
                type="button"
                className="art-slide-arrow"
                onClick={onPrevious}
                disabled={!hasMultipleImages}
                aria-label="Previous image"
              >
                ◀
              </button>

              <button
                type="button"
                className="art-side-preview"
                onClick={onPrevious}
                disabled={!hasMultipleImages}
                aria-label="Show previous image"
              >
                <span className="art-side-thumb-wrap">
                  <Image src={previousImageUrl} alt="" fill sizes="120px" className="art-side-thumb" />
                </span>
              </button>

              <button
                type="button"
                className="art-main-preview"
                onClick={() => onOpenImage(normalizedIndex)}
              >
                <span className="art-main-thumb-wrap">
                  <Image
                    src={currentImageUrl}
                    alt={currentImageLabel}
                    fill
                    sizes="(max-width: 900px) 52vw, 40vw"
                    className="art-main-thumb"
                  />
                </span>
                <span className="art-gallery-caption art-main-caption">{currentImageLabel}</span>
              </button>

              <button
                type="button"
                className="art-side-preview"
                onClick={onNext}
                disabled={!hasMultipleImages}
                aria-label="Show next image"
              >
                <span className="art-side-thumb-wrap">
                  <Image src={nextImageUrl} alt="" fill sizes="120px" className="art-side-thumb" />
                </span>
              </button>

              <button
                type="button"
                className="art-slide-arrow"
                onClick={onNext}
                disabled={!hasMultipleImages}
                aria-label="Next image"
              >
                ▶
              </button>
            </div>
          )
        ) : null}
      </div>
      <p className="folder-hint">
        {isMobile
          ? "Swipe the image or use Previous/Next. Tap the image to open it."
          : "Use arrows or side previews. Click the center image to open it."}
      </p>
    </div>
  );
}
