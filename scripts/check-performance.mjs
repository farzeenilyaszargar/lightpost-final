import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import fs from "node:fs";
const base = process.argv[2] || "http://localhost:3010";
const output = {};
for (const path of ["/", "/fun", "/fun/sudoku", "/api/news"]) {
  // Warm the route once before reporting local request time.
  await (await fetch(new URL(path, base))).arrayBuffer();
  const start = performance.now();
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const text = await response.text();
  const metric = {
    rawBytes: Buffer.byteLength(text),
    gzipBytes: gzipSync(text).length,
    warmLocalMs: Math.round(performance.now() - start),
  };
  output[path] = metric;
  if (path === "/") {
    const styles = [
      ...text.matchAll(/<link[^>]+href="([^"]+\.css[^\"]*)"[^>]*>/g),
    ].map((match) => match[1]);
    output.styles = [];
    for (const href of styles) {
      const css = await (await fetch(new URL(href, base))).text();
      output.styles.push({
        rawBytes: Buffer.byteLength(css),
        gzipBytes: gzipSync(css).length,
        faces: (css.match(/@font-face/g) || []).length,
      });
    }
    output.fontPreloadCount = [
      ...text.matchAll(/<link[^>]+as="font"[^>]*>/g),
    ].length;
    output.initialStoryCards = (text.match(/<article(?:\s|>)/g) || []).length;
    assert.ok(output.fontPreloadCount <= 4, "Too many critical font preloads");
    assert.ok(output.initialStoryCards <= 21, "Too many initial story cards");
    assert.ok(metric.rawBytes < 150000, "Homepage HTML payload regressed");
    assert.ok(
      output.styles.reduce((n, s) => n + s.gzipBytes, 0) < 20000,
      "Stylesheet payload regressed",
    );
  }
  if (path === "/api/news") {
    const page = JSON.parse(text);
    assert.ok(page.articles.length <= 21);
    assert.ok(Number.isInteger(page.total));
    assert.ok(metric.rawBytes < 35000, "News page payload regressed");
  }
}
console.log(JSON.stringify(output, null, 2));
if (process.argv[3])
  fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2) + "\n");
