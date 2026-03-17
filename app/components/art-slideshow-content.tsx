import Image from "next/image";
import { portfolioConfig } from "../portfolio.config";
import { getFileLabelFromUrl } from "../desktop-core";

interface ArtSlideshowContentProps {
  artImageUrls: string[];
  artSlideIndex: number;
  isLoadingArtImages: boolean;
  artGalleryError: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onOpenImage: (index: number) => void;
}

export function ArtSlideshowContent({
  artImageUrls,
  artSlideIndex,
  isLoadingArtImages,
  artGalleryError,
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
              onDoubleClick={() => onOpenImage(normalizedIndex)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onOpenImage(normalizedIndex);
                }
              }}
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
        ) : null}
      </div>
      <p className="folder-hint">Use arrows or side previews. Double-click the center image to open it.</p>
    </div>
  );
}
