import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("the cinematic navigation uses the compact Gerlach monogram image", () => {
  assert.match(html, /<a class="nav-brand" href="#top"[^>]*>\s*<img src="favicon\.png" alt="" width="512" height="512" decoding="async" fetchpriority="high" \/>\s*<\/a>/);
  assert.doesNotMatch(html, /<a class="nav-brand" href="#top"[^>]*>MG<\/a>/);
  assert.doesNotMatch(html, /src="Gerlach Design\.svg"/);
  assert.doesNotMatch(html, /identity-card/);
});

test("the navigation monogram stays compact and unframed", () => {
  assert.match(css, /\.nav-brand\s*\{[^}]*background:\s*transparent;/s);
  assert.match(css, /\.nav-brand img\s*\{[^}]*width:\s*36px;[^}]*height:\s*36px;[^}]*object-fit:\s*contain;[^}]*filter:\s*invert\(1\);/s);
  assert.doesNotMatch(css, /\.identity-card\s*\{|\.portrait-card\s*\{/);
});

test("light mode uses transparent glass without changing the dark navigation treatment", () => {
  assert.match(css, /\.home-page \.main-nav\s*\{[^}]*background:\s*rgba\(12, 12, 17, 0\.28\);/s);
  assert.match(css, /\.home-page\.light-mode \.main-nav\s*\{[^}]*background:\s*rgba\(255, 255, 255, 0\.08\);/s);
  assert.match(css, /\.home-page\.light-mode \.main-nav\.is-over-content\s*\{[^}]*background:\s*rgba\(248, 247, 251, 0\.7\);[^}]*color:\s*var\(--ink\);/s);
  assert.match(css, /\.home-page\.light-mode \.main-nav\.is-over-content \.nav-brand img\s*\{[^}]*filter:\s*none;/s);
});
