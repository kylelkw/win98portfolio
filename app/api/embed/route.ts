import { type NextRequest } from "next/server";

const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);
const PROXY_REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseTargetUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(normalized);
    if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function ensureBaseTag(html: string, targetUrl: string) {
  if (/<base[\s>]/i.test(html)) {
    return html;
  }

  const baseTag = `<base href="${targetUrl}">`;

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }

  if (/<html[\s>]/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  }

  return `<!doctype html><html><head>${baseTag}</head><body>${html}</body></html>`;
}

function stripFrameBusters(html: string) {
  return html
    .replace(/if\s*\(\s*top\s*!==\s*self\s*\)\s*\{?\s*top\.location[^;]*;?\s*\}?/gi, "")
    .replace(/window\.top\.location[^;]*;?/gi, "");
}

function buildErrorHtml(title: string, message: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        font-family: "MS Sans Serif", Tahoma, sans-serif;
        background: #c0c0c0;
        color: #000;
      }
      .box {
        margin: 16px;
        border: 2px inset #fff;
        background: #fff;
        padding: 12px;
        font-size: 12px;
        line-height: 1.4;
      }
      code {
        background: #efefef;
        padding: 1px 3px;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  </body>
</html>`;
}

function buildFallbackEmbedHtml(targetUrl: string, message: string) {
  const safeUrl = escapeHtml(targetUrl);
  const safeMessage = escapeHtml(message);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Compatibility fallback</title>
    <style>
      body {
        margin: 0;
        font-family: "MS Sans Serif", Tahoma, sans-serif;
        background: #c0c0c0;
        color: #000;
      }
      .box {
        margin: 8px;
        border: 2px inset #fff;
        background: #fff;
        padding: 8px;
        font-size: 12px;
      }
      a {
        color: #0000a8;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <strong>Compatibility fallback</strong>
      <p>${safeMessage}</p>
      <p>
        This site may block embedding. Use
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open External</a>.
      </p>
    </div>
  </body>
</html>`;
}

function containsFrameBlockCopy(html: string) {
  return [
    /cannot be shown in a frame/i,
    /can't be displayed in a frame/i,
    /refused to connect/i,
    /frame-ancestors/i,
    /x-frame-options/i,
    /blocked a frame with origin/i,
    /does not allow embedding/i,
  ].some((pattern) => pattern.test(html));
}

function extractTextPreview(html: string) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|article|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (!stripped) {
    return "No readable preview was available for this page.";
  }

  return stripped.length > 5000 ? `${stripped.slice(0, 5000)}\n\n[Preview truncated]` : stripped;
}

function stripHtmlTags(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractReaderLinks(html: string, targetUrl: string) {
  const linkPattern = /<a\b[^>]*href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  const extracted: Array<{ href: string; label: string }> = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(html)) !== null) {
    const rawHref = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.toLowerCase().startsWith("javascript:")) {
      continue;
    }

    let href: string;
    try {
      href = new URL(rawHref, targetUrl).toString();
    } catch {
      continue;
    }

    if (seen.has(href)) {
      continue;
    }
    seen.add(href);

    const rawLabel = stripHtmlTags(match[4] ?? "");
    const label = rawLabel || href;

    extracted.push({
      href,
      label: label.length > 120 ? `${label.slice(0, 117)}...` : label,
    });

    if (extracted.length >= 30) {
      break;
    }
  }

  return extracted;
}

function buildReaderHtml(targetUrl: string, html: string, title: string, message: string) {
  const safeUrl = escapeHtml(targetUrl);
  const preview = escapeHtml(extractTextPreview(html));
  const links = extractReaderLinks(html, targetUrl);
  const linksMarkup =
    links.length > 0
      ? `<ul>${links
          .map(
            (link) =>
              `<li><a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                link.label,
              )}</a></li>`,
          )
          .join("")}</ul>`
      : "<p>No direct links were detected from this page.</p>";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        font-family: "MS Sans Serif", Tahoma, sans-serif;
        background: #c0c0c0;
        color: #000;
      }
      .box {
        margin: 8px;
        border: 2px inset #fff;
        background: #fff;
        padding: 8px;
        font-size: 12px;
      }
      a {
        color: #0000a8;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }
      h2 {
        margin: 10px 0 6px;
        font-size: 12px;
      }
      ul {
        margin: 0 0 10px 16px;
        padding: 0;
      }
      li {
        margin: 0 0 4px;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
      <p>For full functionality, use <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open External</a>.</p>
      <h2>Extracted links</h2>
      ${linksMarkup}
      <h2>Text preview</h2>
      <pre>${preview}</pre>
    </div>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";
  const viewMode = request.nextUrl.searchParams.get("view") === "reader" ? "reader" : "embed";
  const targetUrl = parseTargetUrl(rawUrl);

  if (!targetUrl) {
    return new Response(
      buildErrorHtml("Invalid address", "Please provide a valid http(s) address to load in compatibility mode."),
      {
        status: 400,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: PROXY_REQUEST_HEADERS,
    });
  } catch {
    return new Response(
      buildFallbackEmbedHtml(targetUrl, "The proxy could not fetch this site directly."),
      {
        status: 502,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!upstreamResponse.ok) {
    return new Response(
      buildFallbackEmbedHtml(
        targetUrl,
        `The site returned status ${upstreamResponse.status}. Try Open External for full access.`,
      ),
      {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const contentType = upstreamResponse.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    if (viewMode === "reader") {
      return new Response(
        buildFallbackEmbedHtml(
          targetUrl,
          `Reader mode is only available for HTML pages. Received ${contentType || "unknown content type"}.`,
        ),
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const bytes = await upstreamResponse.arrayBuffer();
    return new Response(bytes, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  }

  const sourceHtml = await upstreamResponse.text();
  if (viewMode === "reader") {
    return new Response(
      buildReaderHtml(
        targetUrl,
        sourceHtml,
        "Reader view",
        "Showing extracted text and links. Some interactive features may not be available.",
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (containsFrameBlockCopy(sourceHtml)) {
    return new Response(
      buildReaderHtml(
        targetUrl,
        sourceHtml,
        "Embed blocked",
        "This site blocks embedding. Showing Reader view instead.",
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const htmlWithBase = ensureBaseTag(sourceHtml, targetUrl);
  const htmlWithoutFrameBusters = stripFrameBusters(htmlWithBase);

  return new Response(htmlWithoutFrameBusters, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
