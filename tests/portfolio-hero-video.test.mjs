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
    /<video id="hero-video" class="hero-video hero-video--intro" width="1280" height="720" autoplay muted loop playsinline preload="metadata" poster="videos\/portfolio-hero-poster-20260729\.jpg">/,
  );
  assert.match(html, /<source src="videos\/portfolio-hero-intro-20260731\.mp4" type="video\/mp4" \/>/);
  assert.match(html, /<video id="hero-work-video" class="hero-video hero-video--work" width="1280" height="720" muted loop playsinline preload="none">/);
  assert.match(html, /<source src="videos\/portfolio-hero-work-20260731\.mp4" type="video\/mp4" \/>/);
  assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|=|>)/);
  assert.match(html, /class="hero-video-fallback"/);
});

test("hero presents the approved static content and four primary destinations", () => {
  assert.match(html, />Hi, I'm<\/p>/);
  assert.match(html, /<h1[^>]*>Martin Gerlach<\/h1>/);
  assert.match(html, />SOFTWARE DEVELOPER • AI BUILDER • UX DESIGNER<\/p>/);
  assert.match(html, />I build digital experiences that are intelligent, intuitive and impactful\.<\/p>/);
  assert.match(html, /class="button hero-cta" href="#projekter"[^>]*>View my work<\/a>/);
  assert.match(html, /class="button hero-secondary-cta" href="#om-mig"[^>]*>About me<\/a>/);
  assert.match(html, /data-hero-copy="working"/);
  assert.match(html, />FROM CONCEPT TO CODE<\/p>/);
  assert.match(html, />I design and build useful digital products\.<\/h2>/);
  assert.match(html, />Combining frontend development, thoughtful UX and practical AI to turn ideas into working experiences\.<\/p>/);

  const nav = html.slice(html.indexOf('<nav class="main-nav"'), html.indexOf("</nav>") + 6);
  for (const target of ["projekter", "om-mig", "faerdigheder", "kontakt"]) {
    assert.match(nav, new RegExp(`href="#${target}"`));
  }
  assert.doesNotMatch(nav, /href="#materiale"/);
});

test("hero keeps a concise scroll track and fullscreen sticky stage", () => {
  assert.match(html, /<header id="top" class="hero">\s*<nav class="main-nav"[\s\S]*?<div class="hero-sticky">/s);
  assert.match(css, /\.home-page \.hero\s*\{[^}]*min-height:\s*220vh;[^}]*min-height:\s*220svh;/s);
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
  assert.match(script, /window\.requestAnimationFrame\(updateScrollProgress\)/);
  assert.match(script, /addEventListener\("scroll", requestScrollUpdate, \{ passive: true \}\)/);
  assert.doesNotMatch(script, /scrollTo|scrollBy|scrollIntoView|ScrollTrigger|gsap/i);
  assert.doesNotMatch(css, /var\(--hero-progress\)/);
});

test("scroll progress drives only composited cinematic properties", () => {
  assert.match(html, /class="hero-transition"[^>]*>\s*<p data-i18n="hero\.discover">Discover my work<\/p>/s);
  assert.match(css, /\.hero-scene-copy \.hero-scene-heading\s*\{[^}]*opacity:\s*calc\(var\(--scene-opacity\)[^}]*transform:\s*translate3d/s);
  assert.match(css, /\.hero-video\s*\{[^}]*transform:\s*scale\(var\(--hero-video-scale,/s);
  assert.match(css, /\.hero-overlay::after\s*\{[^}]*opacity:\s*var\(--hero-overlay-darkness,/s);
  assert.match(css, /\.hero-transition\s*\{[^}]*opacity:\s*var\(--hero-transition-opacity,/s);
  assert.doesNotMatch(script, /style\.(?:top|left|width|height|margin|padding)\s*=/);
});

test("the two video scenes have deterministic playback and fallback states", () => {
  assert.match(script, /introVideo\.addEventListener\("loadeddata"/);
  assert.match(script, /introVideo\.addEventListener\("error", showFallback\)/);
  assert.match(script, /workVideo\.addEventListener\("error"/);
  assert.match(script, /const switchScene = async \(scene\)/);
  assert.match(script, /const targetVideo = scene === "work" \? workVideo : introVideo/);
  assert.match(script, /await video\.play\(\)/);
  assert.match(script, /introVideo\.pause\(\)/);
  assert.match(script, /workVideo\.pause\(\)/);
  assert.match(script, /hero-work-active/);
  assert.match(script, /hero-scene-switching/);
  assert.doesNotMatch(script, /playbackRate\s*=/);
  assert.match(script, /hero-video-ready/);
  assert.match(script, /hero-video-fallback-active/);
});

test("project navigation uses a direct native hash jump without changing playback speed", () => {
  assert.match(script, /const projectsCta = introCopy\.querySelector\("\.hero-cta"\)/);
  assert.match(script, /projectsCta\?\.addEventListener\("click"/);
  assert.match(script, /window\.location\.hash = projectsCta\.hash/);
  assert.match(script, /event\.preventDefault\(\)/);
  assert.doesNotMatch(script, /suspendVideoScrub|scrubVideo/);
  assert.doesNotMatch(script, /scrollTo|scrollBy|scrollIntoView/);
  assert.match(script, /progress >= 0\.1\) switchScene\("work"\)/);
  assert.doesNotMatch(script, /currentTime\s*=\s*progress|progress\s*\*\s*(?:introVideo|workVideo)\.duration/);
  assert.doesNotMatch(script, /playbackRate\s*=/);
});

test("video and poster assets exist without embedding media in the document", async () => {
  const introVideo = await stat(new URL("../videos/portfolio-hero-intro-20260731.mp4", import.meta.url));
  const workVideo = await stat(new URL("../videos/portfolio-hero-work-20260731.mp4", import.meta.url));
  const poster = await stat(new URL("../videos/portfolio-hero-poster-20260729.jpg", import.meta.url));

  assert.ok(introVideo.size > 0);
  assert.ok(workVideo.size > 0);
  assert.ok(introVideo.size + workVideo.size < 10 * 1024 * 1024, "combined hero clips should stay below 10 MiB");
  assert.ok(poster.size > 0);
  assert.doesNotMatch(html, /data:video|data:image/);
});
