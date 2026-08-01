import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../style.css", import.meta.url), "utf8");
const heroScript = fs.readFileSync(new URL("../hero-video.js", import.meta.url), "utf8");
const caseFiles = [
  "studymate-ai.html",
  "lg-bio-capital.html",
  "blade-rhythm.html",
  "aquashield.html",
];

test("hero videos expose stable dimensions and defer the secondary scene", () => {
  assert.match(
    html,
    /id="hero-video"[^>]*width="1280"[^>]*height="720"[^>]*preload="metadata"[^>]*poster=/,
  );
  assert.match(
    html,
    /id="hero-work-video"[^>]*width="1280"[^>]*height="720"[^>]*preload="none"/,
  );
});

test("below-the-fold homepage images reserve space and load asynchronously", () => {
  const images = [...html.matchAll(/<img\s+[^>]+>/g)].map(([image]) => image);
  assert.ok(images.length >= 6);

  images.forEach((image) => {
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
  });
});

test("case-study hero images are prioritized without lazy loading", () => {
  caseFiles.forEach((file) => {
    const source = fs.readFileSync(new URL(`../cases/${file}`, import.meta.url), "utf8");
    const image = source.match(/<img\s+[^>]+>/)?.[0] ?? "";

    assert.match(image, /width="1440"/);
    assert.match(image, /height="900"/);
    assert.match(image, /decoding="async"/);
    assert.match(image, /fetchpriority="high"/);
    assert.doesNotMatch(image, /loading="lazy"/);
  });
});

test("featured cards use two columns on desktop and tablet while hero scenes keep their own crop", () => {
  assert.match(
    css,
    /\.home-page \.project-list\s*{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    css,
    /@media \(max-width: 980px\)[\s\S]*?\.home-page \.project-list\s*{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    css,
    /@media \(max-width: 980px\)[\s\S]*?\.home-page \.hero-video--work\s*{[^}]*object-position:\s*58% center/,
  );
  assert.match(
    css,
    /@media \(max-width: 680px\)[\s\S]*?\.home-page \.hero-video\s*{[^}]*object-position:\s*6% center/,
  );
  assert.match(
    css,
    /@media \(max-width: 680px\)[\s\S]*?\.home-page \.hero-video--work\s*{[^}]*object-position:\s*52% center/,
  );
});

test("hero playback pauses when the page or hero is not visible", () => {
  assert.match(heroScript, /new IntersectionObserver/);
  assert.match(heroScript, /introVideo\.pause\(\);\s*workVideo\.pause\(\);/);
  assert.match(heroScript, /document\.addEventListener\("visibilitychange"/);
  assert.match(heroScript, /window\.addEventListener\("scroll", requestScrollUpdate, \{ passive: true \}\)/);
});

test("the site avoids external font dependencies and preserves reduced motion", () => {
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.home-page \.project-card:hover[\s\S]*?transform:\s*none/);
});

test("light-theme secondary text uses the reviewed accessible tone", () => {
  const accessibleQuietTone = /--quiet:\s*#706b78/;
  assert.equal(css.match(new RegExp(accessibleQuietTone.source, "g"))?.length, 2);
});

test("link arrows distinguish internal navigation from new tabs", () => {
  assert.match(css, /\.home-page \.project-actions \.button::after\s*{[^}]*content:\s*"→"/);
  assert.match(css, /\.home-page \.project-actions \.button\[target="_blank"\]::after[\s\S]*?content:\s*"↗"/);
  assert.doesNotMatch(html, /target="_blank"(?![^>]*rel="noopener noreferrer")/);
});

test("compact navigation and footer links keep mobile-sized touch targets", () => {
  assert.match(css, /\.nav-brand\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*48px/s);
  assert.match(css, /\.home-page \.footer-links a\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
});
