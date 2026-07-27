import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const script = await readFile(new URL("../hero-video.js", import.meta.url), "utf8");

test("hero uses the finished local video with a poster and accessible fallback", () => {
  assert.match(html, /<header id="top" class="hero">/);
  assert.match(
    html,
    /<video id="hero-video" class="hero-video" autoplay muted playsinline preload="metadata" poster="videos\/portfolio-hero-poster\.jpg">/,
  );
  assert.doesNotMatch(html, /<video[^>]*\sloop(?:\s|=|>)/);
  assert.match(html, /<source src="videos\/portfolio-hero-web\.mp4" type="video\/mp4" \/>/);
  assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|=|>)/);
  assert.match(html, /class="hero-video-fallback"/);
});

test("hero presents the approved static content and four primary destinations", () => {
  assert.match(html, />Hi, I'm<\/p>/);
  assert.match(html, /<h1[^>]*>Martin Gerlach<\/h1>/);
  assert.match(html, />SOFTWARE DEVELOPER • AI BUILDER • UX DESIGNER<\/p>/);
  assert.match(html, />I build digital experiences that are intelligent, intuitive and impactful\.<\/p>/);
  assert.match(html, /class="button hero-cta" href="#projekter"[^>]*>View my work<\/a>/);

  const nav = html.slice(html.indexOf('<nav class="main-nav"'), html.indexOf("</nav>") + 6);
  for (const target of ["projekter", "om-mig", "faerdigheder", "kontakt"]) {
    assert.match(nav, new RegExp(`href="#${target}"`));
  }
  assert.doesNotMatch(nav, /href="#materiale"/);
});

test("Sprint 3 keeps the long hero track and fullscreen sticky stage", () => {
  assert.match(html, /<header id="top" class="hero">\s*<div class="hero-sticky">/s);
  assert.match(css, /\.hero\s*\{[^}]*min-height:\s*240vh;[^}]*min-height:\s*240svh;/s);
  assert.match(css, /\.hero-sticky\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*height:\s*100vh;[^}]*height:\s*100svh;[^}]*overflow:\s*hidden;/s);
  assert.match(css, /\.hero-video\s*\{[^}]*object-fit:\s*cover;/s);
  assert.match(css, /\.hero-overlay\s*\{[^}]*linear-gradient/s);
  assert.doesNotMatch(css, /\.hero\s*\{[^}]*overflow:\s*(?:hidden|auto|scroll)/s);
});

test("hero progress is normalized without hijacking or animating scroll", () => {
  assert.match(script, /hero\.offsetHeight - window\.innerHeight/);
  assert.match(script, /scrolledDistance \/ scrollDistance/);
  assert.match(script, /--hero-progress/);
  assert.match(script, /dataset\.scrollProgress/);
  assert.match(script, /window\.requestAnimationFrame\(updateHeroProgress\)/);
  assert.match(script, /addEventListener\("scroll", requestProgressUpdate, \{ passive: true \}\)/);
  assert.doesNotMatch(script, /preventDefault|scrollTo|scrollBy|scrollIntoView|ScrollTrigger|gsap/i);
  assert.doesNotMatch(css, /var\(--hero-progress\)/);
});

test("scroll progress drives only composited cinematic properties", () => {
  assert.match(html, /class="hero-transition"[^>]*>\s*<p data-i18n="hero\.discover">Discover my work<\/p>/s);
  assert.match(css, /\.hero-copy\s*\{[^}]*opacity:\s*var\(--hero-copy-opacity,[^}]*transform:\s*translate3d/s);
  assert.match(css, /\.hero-video\s*\{[^}]*transform:\s*scale\(var\(--hero-video-scale,/s);
  assert.match(css, /\.hero-overlay::after\s*\{[^}]*opacity:\s*var\(--hero-overlay-darkness,/s);
  assert.match(css, /\.hero-transition\s*\{[^}]*opacity:\s*var\(--hero-transition-opacity,/s);
  assert.doesNotMatch(script, /style\.(?:top|left|width|height|margin|padding)\s*=/);
});

test("video metadata, normal playback and media errors have deterministic states", () => {
  assert.match(script, /video\.addEventListener\("loadedmetadata"/);
  assert.match(script, /video\.addEventListener\("loadeddata", showVideo\)/);
  assert.match(script, /video\.addEventListener\("timeupdate", keepSceneInRange\)/);
  assert.match(script, /video\.addEventListener\("ended", loopActiveScene\)/);
  assert.match(script, /video\.addEventListener\("error", showFallback\)/);
  assert.match(script, /video\.pause\(\)/);
  assert.match(script, /video\.play\(\)/);
  assert.match(script, /const WORK_START_TIME = 16\.6/);
  assert.match(script, /switchScene\("work"\)/);
  assert.match(script, /hero-scene-switching/);
  assert.doesNotMatch(script, /progress \* Math\.max\(video\.duration/);
  assert.doesNotMatch(script, /playbackRate\s*=/);
  assert.match(script, /video\.readyState >= 1/);
  assert.match(script, /hero-video-ready/);
  assert.match(script, /hero-video-fallback-active/);
});

test("project navigation remains native and video time is not scrubbed by scroll", () => {
  assert.doesNotMatch(script, /heroCta\?\.addEventListener\("click"/);
  assert.doesNotMatch(script, /suspendVideoScrub|scrubVideo/);
  assert.doesNotMatch(script, /preventDefault\(\)/);
});

test("video and poster assets exist without embedding media in the document", async () => {
  const video = await stat(new URL("../videos/portfolio-hero-web.mp4", import.meta.url));
  const poster = await stat(new URL("../videos/portfolio-hero-poster.jpg", import.meta.url));

  assert.ok(video.size > 0);
  assert.ok(video.size < 10 * 1024 * 1024, "production hero video should stay below 10 MiB");
  assert.ok(poster.size > 0);
  assert.doesNotMatch(html, /data:video|data:image/);
});
