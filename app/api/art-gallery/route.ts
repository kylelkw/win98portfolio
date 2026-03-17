import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ART_GALLERY_DIRECTORY = path.join(process.cwd(), "public", "art-gallery");
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".bmp"]);

function isSupportedImage(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.has(extension);
}

export async function GET() {
  try {
    const directoryEntries = await readdir(ART_GALLERY_DIRECTORY, { withFileTypes: true });

    const images = directoryEntries
      .filter((entry) => entry.isFile() && isSupportedImage(entry.name))
      .map((entry) => entry.name)
      .sort((first, second) => first.localeCompare(second, undefined, { numeric: true, sensitivity: "base" }))
      .map((filename) => `/art-gallery/${encodeURIComponent(filename)}`);

    return NextResponse.json(
      { images },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return NextResponse.json(
        { images: [] as string[] },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json({ error: "Failed to load art gallery images." }, { status: 500 });
  }
}
