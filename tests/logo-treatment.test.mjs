import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("the cinematic navigation uses the compact MG monogram", () => {
  assert.match(html, /<a class="nav-brand" href="#top"[^>]*>MG<\/a>/);
  assert.doesNotMatch(html, /src="Gerlach Design\.svg"/);
  assert.doesNotMatch(html, /identity-card/);
});

test("the MG monogram remains an unframed text treatment", () => {
  assert.match(css, /\.nav-brand\s*\{[^}]*background:\s*transparent;/s);
  assert.match(css, /\.nav-brand\s*\{[^}]*font-size:\s*1\.25rem/s);
  assert.doesNotMatch(css, /\.identity-card\s*\{|\.portrait-card\s*\{/);
});
