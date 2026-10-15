const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(require.resolve("../app/api/embed/route.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadRoute(fetch) {
  const exports = {};
  vm.runInNewContext(compiled, { exports, fetch, Response, URL, AbortSignal });
  return exports.GET;
}

function request(url) {
  return { nextUrl: new URL(`http://localhost/api/embed?url=${encodeURIComponent(url)}`) };
}

test("unsupported upstream status 999 produces a readable fallback instead of crashing", async () => {
  const get = loadRoute(async () => ({ ok: false, status: 999 }));
  const response = await get(request("https://www.linkedin.com/in/kyle-f-lee"));
  assert.equal(response.status, 502);
  const html = await response.text();
  assert.match(html, /status 999/);
  assert.match(html, /Open External/);
});

test("failed or timed-out requests produce an external link", async () => {
  const get = loadRoute(async () => { throw new Error("Request timed out"); });
  const response = await get(request("https://example.com"));
  assert.equal(response.status, 502);
  assert.match(await response.text(), /could not fetch this site directly/);
});

test("invalid addresses are rejected without fetching", async () => {
  const get = loadRoute(async () => { assert.fail("Invalid addresses must not be fetched"); });
  const response = await get(request("javascript:alert(1)"));
  assert.equal(response.status, 400);
});
