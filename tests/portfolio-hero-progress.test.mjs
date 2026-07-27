import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../hero-video.js", import.meta.url), "utf8");

function createHeroRuntime() {
  const listeners = new Map();
  const frames = [];
  const styles = new Map();
  const classes = new Set();
  const ctaAttributes = new Map();
  const ctaListeners = new Map();
  const videoListeners = new Map();
  const timers = [];
  let heroTop = 0;
  let pauseCalls = 0;
  let playCalls = 0;

  const hero = {
    offsetHeight: 2400,
    dataset: {},
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
    getBoundingClientRect: () => ({ top: heroTop }),
    style: {
      setProperty: (name, value) => styles.set(name, value),
    },
  };

  const video = {
    readyState: 0,
    duration: 40,
    currentTime: 0,
    playbackRate: 1,
    seeking: false,
    addEventListener: (name, handler) => videoListeners.set(name, handler),
    pause: () => {
      pauseCalls += 1;
    },
    play: () => {
      playCalls += 1;
      return Promise.resolve();
    },
  };

  const cta = {
    addEventListener: (name, handler) => ctaListeners.set(name, handler),
    removeAttribute: (name) => ctaAttributes.delete(name),
    setAttribute: (name, value) => ctaAttributes.set(name, value),
  };

  const window = {
    innerHeight: 1000,
    addEventListener: (name, handler, options) => {
      listeners.set(name, { handler, options });
    },
    requestAnimationFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    setTimeout: (callback) => {
      timers.push(callback);
      return timers.length;
    },
  };

  const document = {
    querySelector: (selector) => selector === ".hero" ? hero : cta,
    getElementById: () => video,
  };

  vm.runInNewContext(source, { document, window });

  return {
    hero,
    listeners,
    frames,
    styles,
    classes,
    ctaAttributes,
    ctaListeners,
    videoListeners,
    timers,
    video,
    getPauseCalls: () => pauseCalls,
    getPlayCalls: () => playCalls,
    setHeroTop: (value) => {
      heroTop = value;
    },
    runNextFrame: () => frames.shift()?.(),
    runNextTimer: () => timers.shift()?.(),
  };
}

test("hero progress begins at zero and scroll listening is passive", () => {
  const runtime = createHeroRuntime();

  assert.equal(runtime.hero.dataset.scrollProgress, "0.0000");
  assert.equal(runtime.hero.dataset.scrollStage, "initial");
  assert.equal(runtime.styles.get("--hero-progress"), "0.0000");
  assert.equal(runtime.styles.get("--hero-cta-opacity"), "1.0000");
  assert.equal(runtime.styles.get("--hero-copy-opacity"), "1.0000");
  assert.equal(runtime.styles.get("--hero-transition-opacity"), "0.0000");
  assert.equal(runtime.styles.get("--hero-video-scale"), "1.0000");
  assert.equal(runtime.listeners.get("scroll").options.passive, true);
});

test("hero progress reaches one half and one at the expected positions", () => {
  const runtime = createHeroRuntime();
  const scroll = runtime.listeners.get("scroll").handler;

  runtime.setHeroTop(-700);
  scroll();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollProgress, "0.5000");
  assert.equal(runtime.hero.dataset.scrollStage, "transition");
  assert.equal(runtime.styles.get("--hero-cta-opacity"), "0.0000");
  assert.ok(Number(runtime.styles.get("--hero-copy-opacity")) < 0.2);
  assert.ok(Number(runtime.styles.get("--hero-transition-opacity")) > 0);
  assert.equal(runtime.ctaAttributes.get("tabindex"), "-1");
  assert.equal(runtime.video.currentTime, 0);

  runtime.setHeroTop(-1400);
  scroll();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollProgress, "1.0000");
  assert.equal(runtime.hero.dataset.scrollStage, "final");
  assert.equal(runtime.styles.get("--hero-copy-opacity"), "0.0000");
  assert.equal(runtime.styles.get("--hero-transition-opacity"), "0.0000");
  assert.equal(runtime.styles.get("--hero-video-scale"), "1.0300");
  assert.equal(runtime.styles.get("--hero-overlay-darkness"), "0.9000");
  assert.equal(runtime.video.currentTime, 0);
  assert.equal(runtime.getPauseCalls(), 1);
});

test("hero progress clamps positions outside its scroll track", () => {
  const runtime = createHeroRuntime();
  const scroll = runtime.listeners.get("scroll").handler;

  runtime.setHeroTop(300);
  scroll();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollProgress, "0.0000");
  assert.equal(runtime.ctaAttributes.has("tabindex"), false);

  runtime.setHeroTop(-3000);
  scroll();
  runtime.runNextFrame();
  assert.equal(runtime.hero.dataset.scrollProgress, "1.0000");
});

test("scroll switches scenes once without tying playback time to progress", () => {
  const runtime = createHeroRuntime();

  runtime.videoListeners.get("loadedmetadata")();
  assert.equal(runtime.hero.dataset.videoScene, "walk");
  assert.equal(runtime.getPlayCalls(), 1);

  runtime.video.currentTime = 5;
  runtime.setHeroTop(-700);
  runtime.listeners.get("scroll").handler();
  runtime.runNextFrame();

  assert.equal(runtime.hero.dataset.scrollProgress, "0.5000");
  assert.equal(runtime.video.currentTime, 5);
  assert.equal(runtime.hero.dataset.videoScene, "walk-to-work");
  assert.equal(runtime.timers.length, 1);

  runtime.runNextTimer();
  assert.equal(runtime.hero.dataset.videoScene, "work");
  assert.equal(runtime.video.currentTime, 16.6);
  runtime.runNextFrame();

  runtime.setHeroTop(-840);
  runtime.listeners.get("scroll").handler();
  runtime.runNextFrame();
  assert.equal(runtime.video.currentTime, 16.6);
  assert.equal(runtime.video.playbackRate, 1);
  assert.equal(runtime.timers.length, 0);
});
