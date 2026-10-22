const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    module._compile(compiled, filename);
  };
}

const { MobilePortfolioContent } = require("../app/components/mobile-portfolio-content.tsx");
const { portfolioConfig } = require("../app/portfolio.config.ts");

test("mobile resume displays a local image without an embedded document viewer", () => {
  const html = renderToStaticMarkup(React.createElement(MobilePortfolioContent, {
    activeSection: "resume",
    artImageUrls: [],
  }));
  const image = html.match(/<img\b[^>]*class="mobile-resume-preview"[^>]*>/)?.[0];
  assert.ok(image, "Resume preview must render as a native image");
  assert.ok(image.includes(`src="${portfolioConfig.resume.previewImage}"`));
  assert.match(image, /width="1546"/);
  assert.match(image, /height="2000"/);
  assert.doesNotMatch(html, /<iframe\b/);
  assert.ok(html.includes(`href="${portfolioConfig.resume.url}"`));
  assert.ok(html.includes(`href="${portfolioConfig.resume.previewImage}"`));
  const asset = fs.readFileSync(path.join(__dirname, "../public", portfolioConfig.resume.previewImage));
  assert.equal(asset.toString("ascii", 0, 4), "RIFF");
  assert.equal(asset.toString("ascii", 8, 12), "WEBP");
  assert.match(html, /Software Developer &amp; Computer Vision Researcher/);
});
