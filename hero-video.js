(() => {
  const hero = document.querySelector(".hero");
  const video = document.getElementById("hero-video");
  const heroCta = document.querySelector(".hero-cta");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (!hero || !video) return;

  const WORK_START_TIME = 16.6;
  const WALK_LOOP_START = 0.4;
  const SWITCH_TO_WORK_PROGRESS = 0.34;
  const SWITCH_TO_WALK_PROGRESS = 0.14;
  const SCENE_FADE_MS = 280;

  let progressFrame = 0;
  let metadataReady = false;
  let sceneSwitching = false;
  let activeScene = "walk";
  let lastProgress = 0;
  let pausedAfterHero = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothRange = (value, start, end) => {
    const normalized = clamp((value - start) / (end - start));
    return normalized * normalized * (3 - 2 * normalized);
  };

  const playVideo = () => {
    if (reduceMotion) return;

    const playback = video.play();
    if (!playback || typeof playback.then !== "function") return;

    playback
      .then(() => hero.classList.remove("hero-video-autoplay-blocked"))
      .catch(() => hero.classList.add("hero-video-autoplay-blocked"));
  };

  const sceneStartTime = (scene) => scene === "work" ? WORK_START_TIME : WALK_LOOP_START;

  const switchScene = (nextScene) => {
    if (!metadataReady || reduceMotion || sceneSwitching || nextScene === activeScene) return;

    sceneSwitching = true;
    hero.classList.add("hero-scene-switching");
    hero.dataset.videoScene = `${activeScene}-to-${nextScene}`;

    window.setTimeout(() => {
      video.currentTime = Math.min(sceneStartTime(nextScene), Math.max(video.duration - 0.1, 0));
      activeScene = nextScene;
      hero.dataset.videoScene = activeScene;
      playVideo();

      window.requestAnimationFrame(() => {
        hero.classList.remove("hero-scene-switching");
        sceneSwitching = false;
      });
    }, SCENE_FADE_MS);
  };

  const updatePlaybackForProgress = (progress) => {
    if (progress >= SWITCH_TO_WORK_PROGRESS) switchScene("work");
    else if (progress <= SWITCH_TO_WALK_PROGRESS) switchScene("walk");

    if (progress >= 0.99 && !pausedAfterHero) {
      video.pause();
      pausedAfterHero = true;
    } else if (progress < 0.99 && pausedAfterHero) {
      pausedAfterHero = false;
      playVideo();
    }
  };

  const updateHeroProgress = () => {
    progressFrame = 0;

    const scrollDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const scrolledDistance = -hero.getBoundingClientRect().top;
    const progress = reduceMotion ? 0 : clamp(scrolledDistance / scrollDistance);
    lastProgress = progress;

    const ctaFade = smoothRange(progress, 0.08, 0.2);
    const copyFade = smoothRange(progress, 0.12, 0.34);
    const scrollIndicatorFade = smoothRange(progress, 0.04, 0.22);
    const darkness = smoothRange(progress, 0.6, 0.96);
    const videoScale = smoothRange(progress, 0.15, 0.92);
    const transitionIn = smoothRange(progress, 0.25, 0.4);
    const transitionOut = smoothRange(progress, 0.48, 0.64);
    const transitionOpacity = transitionIn * (1 - transitionOut);
    const copyOffset = smoothRange(progress, 0.12, 0.5) * -28;

    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    hero.style.setProperty("--hero-cta-opacity", (1 - ctaFade).toFixed(4));
    hero.style.setProperty("--hero-copy-opacity", (1 - copyFade).toFixed(4));
    hero.style.setProperty("--hero-copy-y", `${copyOffset.toFixed(2)}px`);
    hero.style.setProperty("--hero-scroll-opacity", (1 - scrollIndicatorFade).toFixed(4));
    hero.style.setProperty("--hero-overlay-darkness", (darkness * 0.9).toFixed(4));
    hero.style.setProperty("--hero-video-scale", (1 + 0.03 * videoScale).toFixed(4));
    hero.style.setProperty("--hero-transition-opacity", transitionOpacity.toFixed(4));
    hero.dataset.scrollProgress = progress.toFixed(4);
    hero.dataset.scrollStage = progress < 0.15
      ? "initial"
      : progress < 0.45
        ? "early"
        : progress < 0.75
          ? "transition"
          : "final";

    if (heroCta) {
      if (ctaFade > 0.95) heroCta.setAttribute("tabindex", "-1");
      else heroCta.removeAttribute("tabindex");
    }

    updatePlaybackForProgress(progress);
  };

  const requestProgressUpdate = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(updateHeroProgress);
  };

  const showFallback = () => {
    hero.classList.remove("hero-video-ready");
    hero.classList.add("hero-video-fallback-active");
  };

  const showVideo = () => {
    hero.classList.remove("hero-video-fallback-active");
    hero.classList.add("hero-video-ready");
  };

  const keepSceneInRange = () => {
    if (!metadataReady || video.seeking) return;

    if (activeScene === "walk" && lastProgress < SWITCH_TO_WORK_PROGRESS && video.currentTime >= WORK_START_TIME - 0.12) {
      video.currentTime = WALK_LOOP_START;
      playVideo();
    }
  };

  const loopActiveScene = () => {
    if (!metadataReady || reduceMotion) return;
    video.currentTime = sceneStartTime(activeScene);
    playVideo();
  };

  video.addEventListener("loadedmetadata", () => {
    metadataReady = true;
    activeScene = lastProgress >= SWITCH_TO_WORK_PROGRESS ? "work" : "walk";
    hero.dataset.videoScene = activeScene;

    if (activeScene === "work") video.currentTime = Math.min(WORK_START_TIME, Math.max(video.duration - 0.1, 0));

    showVideo();
    if (reduceMotion) video.pause();
    else playVideo();
  });
  video.addEventListener("loadeddata", showVideo);
  video.addEventListener("timeupdate", keepSceneInRange);
  video.addEventListener("ended", loopActiveScene);
  video.addEventListener("error", showFallback);

  if (video.readyState >= 1) {
    metadataReady = true;
    hero.dataset.videoScene = activeScene;
    showVideo();
    if (reduceMotion) video.pause();
    else playVideo();
  }

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
  updateHeroProgress();
})();
