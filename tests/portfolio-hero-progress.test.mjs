import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../hero-video.js", import.meta.url), "utf8");

function createClassList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    toggle: (name, force) => {
      if (force) values.add(name);
      else values.delete(name);
    },
    contains: (name) => values.has(name),
    has: (name) => values.has(name),
  };
}

function createElement() {
  const styles = new Map();
  const attributes = new Map();
  const listeners = new Map();
  return {
    classList: createClassList(),
    dataset: {},
    hash: "",
    style: { setProperty: (name, value) => styles.set(name, value) },
    addEventListener: (name, handler) => listeners.set(name, handler),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
    querySelector: () => null,
    querySelectorAll: () => [],
    styles,
    attributes,
    listeners,
  };
}

function createVideo() {
  const listeners = new Map();
  return {
    currentTime: 0,
    playbackRate: 1,
    paused: true,
    listeners,
    addEventListener: (name, handler) => listeners.set(name, handler),
    play() {
      this.paused = false;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
    },
  };
}

function createHeroRuntime() {
  const listeners = new Map();
  const frames = [];
  const timers = new Map();
  const hero = createElement();
  const navigation = createElement();
  const introCopy = createElement();
  const workCopy = createElement();
  const heroLink = createElement();
  const introVideo = createVideo();
  const workVideo = createVideo();
  const documentElement = createElement();
  documentElement.scrollHeight = 5000;
  heroLink.hash = "#projekter";
  introCopy.querySelector = (selector) => selector === ".hero-cta" ? heroLink : null;
  introCopy.querySelectorAll = () => [heroLink];
  hero.offsetHeight = 2400;
  let heroTop = 0;
  hero.getBoundingClientRect = () => ({ top: heroTop });

  const window = {
    innerHeight: 1000,
    scrollY: 0,
    location: { hash: "" },
    matchMedia: () => ({ matches: false }),
    addEventListener: (name, handler, options) => listeners.set(name, { handler, options }),
    requestAnimationFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    setTimeout: (callback) => {
      const id = timers.size + 1;
      timers.set(id, callback);
      return id;
    },
  };

  const selectors = new Map([
    [".hero", hero],
    [".main-nav", navigation],
    ['[data-hero-copy="walking"]', introCopy],
    ['[data-hero-copy="working"]', workCopy],
  ]);
  const elementsById = new Map([
    ["hero-video", introVideo],
    ["hero-work-video", workVideo],
  ]);
  const document = {
    hidden: false,
    documentElement,
    querySelector: (selector) => selectors.get(selector) ?? null,
    querySelectorAll: () => [],
    getElementById: (id) => elementsById.get(id) ?? null,
    addEventListener: () => {},
  };

  vm.runInNewContext(source, { document, window });

  return {
    hero,
    introCopy,
    workCopy,
    heroLink,
    introVideo,
    workVideo,
    documentElement,
    window,
    listeners,
    setHeroTop: (value) => { heroTop = value; },
    runNextFrame: () => frames.shift()?.(),
    runNextTimer: () => {
      const next = timers.entries().next().value;
      if (!next) return;
      timers.delete(next[0]);
      next[1]();
    },
  };
}

test("hero CTA jumps directly to Projects before the intro actions disappear", () => {
  const runtime = createHeroRuntime();
  let defaultPrevented = false;

  runtime.heroLink.listeners.get("click")({
    preventDefault: () => { defaultPrevented = true; },
  });

  assert.equal(defaultPrevented, true);
  assert.equal(runtime.window.location.hash, "#projekter");
  assert.equal(runtime.documentElement.classList.has("is-direct-anchor"), true);

  runtime.runNextFrame();
  assert.equal(runtime.documentElement.classList.has("is-direct-anchor"), false);
});

async function activateScene(runtime, heroTop) {
  runtime.setHeroTop(heroTop);
  runtime.listeners.get("scroll").handler();
  runtime.runNextFrame();
  for (let index = 0; index < 4; index += 1) {
    await Promise.resolve();
  }
  runtime.runNextFrame();
}

test("hero progress begins at zero and scroll listening is passive", () => {
  const runtime = createHeroRuntime();

  assert.equal(runtime.hero.dataset.scrollProgress, "0.0000");
  assert.equal(runtime.hero.dataset.scrollStage, "initial");
  assert.equal(runtime.hero.dataset.videoScene, "walking");
  assert.equal(runtime.hero.styles.get("--hero-progress"), "0.0000");
  assert.equal(runtime.hero.styles.get("--hero-action-scroll-opacity"), "1.0000");
  assert.equal(runtime.hero.styles.get("--hero-transition-opacity"), "0.0000");
  assert.equal(runtime.listeners.get("scroll").options.passive, true);
  assert.equal(runtime.introCopy.styles.get("--scene-opacity"), "1.0000");
  assert.equal(runtime.workCopy.styles.get("--scene-opacity"), "0.0000");
});

test("normal scroll starts the dedicated work clip without changing playback speed", async () => {
  const runtime = createHeroRuntime();
  runtime.introVideo.currentTime = 3;

  await activateScene(runtime, -350);

  assert.equal(runtime.hero.dataset.scrollProgress, "0.2500");
  assert.equal(runtime.hero.dataset.scrollStage, "work");
  assert.equal(runtime.hero.dataset.videoScene, "working");
  assert.equal(runtime.hero.classList.has("hero-work-active"), true);
  assert.equal(runtime.workVideo.paused, false);
  assert.equal(runtime.workVideo.currentTime, 0);
  assert.equal(runtime.introVideo.playbackRate, 1);
  assert.equal(runtime.workVideo.playbackRate, 1);
  assert.equal(runtime.introCopy.styles.get("--scene-opacity"), "0.0000");
  assert.equal(runtime.workCopy.styles.get("--scene-opacity"), "1.0000");

  runtime.runNextTimer();
  assert.equal(runtime.introVideo.paused, true);
});

test("work copy remains readable until the final project transition", async () => {
  const runtime = createHeroRuntime();
  await activateScene(runtime, -700);

  assert.equal(runtime.hero.dataset.scrollProgress, "0.5000");
  assert.equal(runtime.hero.dataset.scrollStage, "work");
  assert.equal(runtime.hero.styles.get("--hero-heading-scroll-opacity"), "1.0000");
  assert.equal(runtime.hero.styles.get("--hero-transition-opacity"), "0.0000");
  assert.equal(runtime.hero.styles.get("--hero-scroll-opacity"), "0.0000");
  assert.equal(runtime.heroLink.attributes.get("tabindex"), "-1");

  runtime.setHeroTop(-1120);
  runtime.listeners.get("scroll").handler();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollStage, "transition");
  assert.ok(Number(runtime.hero.styles.get("--hero-transition-opacity")) > 0);
  assert.equal(runtime.hero.styles.get("--hero-scroll-opacity"), "0.0000");

  runtime.setHeroTop(-1400);
  runtime.listeners.get("scroll").handler();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollStage, "final");
  assert.equal(runtime.hero.styles.get("--hero-video-scale"), "1.0250");
  assert.equal(runtime.hero.styles.get("--hero-overlay-darkness"), "0.9400");
  assert.equal(runtime.hero.styles.get("--hero-transition-opacity"), "0.0000");
});

test("scrolling back to the top restores the drone clip", async () => {
  const runtime = createHeroRuntime();
  await activateScene(runtime, -350);
  runtime.runNextTimer();

  await activateScene(runtime, 0);

  assert.equal(runtime.hero.dataset.scrollProgress, "0.0000");
  assert.equal(runtime.hero.dataset.videoScene, "walking");
  assert.equal(runtime.hero.classList.has("hero-work-active"), false);
  assert.equal(runtime.introVideo.paused, false);
  assert.equal(runtime.introCopy.styles.get("--scene-opacity"), "1.0000");
  assert.equal(runtime.workCopy.styles.get("--scene-opacity"), "0.0000");

  runtime.runNextTimer();
  assert.equal(runtime.workVideo.paused, true);
});

test("scene switching is independent from scroll scrubbing", () => {
  assert.match(source, /const introVideo = document\.getElementById\("hero-video"\)/);
  assert.match(source, /const workVideo = document\.getElementById\("hero-work-video"\)/);
  assert.match(source, /progress >= 0\.1\) switchScene\("work"\)/);
  assert.doesNotMatch(source, /playbackRate\s*=/);
  assert.doesNotMatch(source, /currentTime\s*=\s*progress|progress\s*\*\s*(?:introVideo|workVideo)\.duration/);
  assert.doesNotMatch(source, /scrollTo|scrollBy|scrollIntoView/);
});
