import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { sanitizeHtml } from "../src/lib/sanitize";
import { journalSaveFailure } from "../src/lib/journal-errors";

test("journal sanitizer loads when CommonJS cannot require ES modules", () => {
  const result = spawnSync(process.execPath, [
    "--no-experimental-require-module", "--import", "tsx", "-e",
    'const {sanitizeHtml}=require("./src/lib/sanitize.ts"); if(sanitizeHtml("<p>Journal</p>")!=="<p>Journal</p>") process.exit(1);',
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("journal HTML preserves supported formatting, images and links", () => {
  const html = sanitizeHtml('<h2>Story</h2><p>A <strong>portrait</strong> &amp; a <em>story</em>.</p><figure><img src="https://example.com/photo.jpg" alt="Portrait"><figcaption>Caption</figcaption></figure><ul><li>Item</li></ul><a href="/portfolio" target="_blank">Work</a>');
  assert.match(html, /<h2>Story<\/h2>/);
  assert.match(html, /<strong>portrait<\/strong>/);
  assert.match(html, /src="https:\/\/example.com\/photo.jpg"/);
  assert.match(html, /alt="Portrait"/);
  assert.match(html, /href="\/portfolio"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("journal HTML removes active content, unsafe URLs and event handlers", () => {
  const html = sanitizeHtml('<script>alert(1)</script><iframe src="https://bad.example"></iframe><svg onload="alert(1)"></svg><img src="data:text/html,bad" onerror="alert(1)"><a href="jav&#x61;script:alert(1)" onclick="bad()">link</a><p style="color:red">Safe</p>');
  assert.doesNotMatch(html, /script|iframe|svg|onerror|onclick|onload|data:|style=/i);
  assert.match(html, /<p>Safe<\/p>/);
});

test("duplicate slug and deleted-record errors return form feedback", () => {
  assert.equal(journalSaveFailure({ code: "P2002" }).fieldErrors?.slug, "Choose a unique slug.");
  assert.match(journalSaveFailure({ code: "P2025" }).message!, /no longer exists/);
});
