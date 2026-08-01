(() => {
  const hero = document.querySelector(".hero");
  const introVideo = document.getElementById("hero-video");
  const workVideo = document.getElementById("hero-work-video");
  const navigation = document.querySelector(".main-nav");
  const introCopy = document.querySelector('[data-hero-copy="walking"]');
  const workCopy = document.querySelector('[data-hero-copy="working"]');

  if (!hero || !introVideo || !workVideo || !introCopy || !workCopy) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const heroLinks = introCopy.querySelectorAll("a");
  const projectsCta = introCopy.querySelector(".hero-cta");
  const navLinks = [...document.querySelectorAll("[data-nav-section]")];
  const observedSections = navLinks
    .map((link) => document.getElementById(link.dataset.navSection))
    .filter(Boolean);

  let scrollFrame = 0;
  let heroIsVisible = true;
  let activeScene = "intro";
  let requestedScene = "intro";
  let sceneRequestId = 0;
  let actionScrollOpacity = 1;
  let headingScrollOpacity = 1;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const smoothRange = (value, start, end) => {
    const normalized = clamp((value - start) / (end - start));
    return normalized * normalized * (3 - 2 * normalized);
  };

  const setCopyState = (element, opacity) => {
    const visibleOpacity = opacity * headingScrollOpacity;
    element.style.setProperty("--scene-opacity", opacity.toFixed(4));
    element.classList.toggle("is-active", opacity > 0.015);
    element.setAttribute("aria-hidden", String(visibleOpacity <= 0.015));
  };

  const updateLinkAvailability = () => {
    const linksAreVisible = activeScene === "intro" && actionScrollOpacity > 0.08;

    heroLinks.forEach((link) => {
      if (linksAreVisible) link.removeAttribute("tabindex");
      else link.setAttribute("tabindex", "-1");
    });
  };

  const applyScene = (scene) => {
    activeScene = scene;
    const workIsActive = scene === "work";

    hero.classList.toggle("hero-work-active", workIsActive);
    hero.classList.remove("hero-scene-switching");
    hero.dataset.videoScene = workIsActive ? "working" : "walking";
    setCopyState(introCopy, workIsActive ? 0 : 1);
    setCopyState(workCopy, workIsActive ? 1 : 0);
    updateLinkAvailability();
  };

  const showFallback = () => {
    introVideo.pause();
    workVideo.pause();
    hero.classList.remove("hero-video-ready", "hero-work-active", "hero-scene-switching");
    hero.classList.add("hero-video-fallback-active");
    requestedScene = "intro";
    applyScene("intro");
  };

  const playVideo = async (video) => {
    if (reducedMotion || !heroIsVisible) return false;

    try {
      await video.play();
      hero.classList.remove("hero-video-fallback-active", "hero-video-autoplay-blocked");
      hero.classList.add("hero-video-ready");
      return true;
    } catch {
      return false;
    }
  };

  const switchScene = async (scene) => {
    if (reducedMotion || requestedScene === scene) return;

    requestedScene = scene;
    const requestId = ++sceneRequestId;
    const targetVideo = scene === "work" ? workVideo : introVideo;
    const previousVideo = scene === "work" ? introVideo : workVideo;

    hero.classList.add("hero-scene-switching");

    if (scene === "work" && targetVideo.currentTime > 0.4) {
      targetVideo.currentTime = 0;
    }

    const started = await playVideo(targetVideo);
    if (requestId !== sceneRequestId) return;

    if (!started) {
      requestedScene = activeScene;
      hero.classList.remove("hero-scene-switching");
      return;
    }

    window.requestAnimationFrame(() => {
      if (requestId !== sceneRequestId) return;
      applyScene(scene);
      window.setTimeout(() => previousVideo.pause(), 460);
    });
  };

  const updateActiveNavigation = () => {
    const marker = window.scrollY + window.innerHeight * 0.38;
    let activeSection = "";

    observedSections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= marker) activeSection = section.id;
    });

    const reachedPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (reachedPageEnd && observedSections.length) {
      activeSection = observedSections.at(-1).id;
    }

    navLinks.forEach((link) => {
      if (link.dataset.navSection === activeSection) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateScrollProgress = () => {
    scrollFrame = 0;

    const scrollDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const scrolledDistance = -hero.getBoundingClientRect().top;
    const progress = reducedMotion ? 0 : clamp(scrolledDistance / scrollDistance);
    actionScrollOpacity = 1 - smoothRange(progress, 0.04, 0.14);
    const supportScrollOpacity = 1 - smoothRange(progress, 0.62, 0.8);
    headingScrollOpacity = 1 - smoothRange(progress, 0.68, 0.86);
    const darkness = smoothRange(progress, 0.36, 0.96);
    const videoScale = smoothRange(progress, 0.18, 0.9);
    const transitionIn = smoothRange(progress, 0.76, 0.84);
    const transitionOut = smoothRange(progress, 0.9, 0.97);
    const transitionOpacity = transitionIn * (1 - transitionOut);
    const headingOffset = smoothRange(progress, 0.64, 0.88) * -24;

    if (!reducedMotion && progress >= 0.1) switchScene("work");
    else if (!reducedMotion && progress <= 0.03) switchScene("intro");

    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    hero.style.setProperty("--hero-action-scroll-opacity", actionScrollOpacity.toFixed(4));
    hero.style.setProperty("--hero-support-scroll-opacity", supportScrollOpacity.toFixed(4));
    hero.style.setProperty("--hero-heading-scroll-opacity", headingScrollOpacity.toFixed(4));
    hero.style.setProperty("--hero-heading-y", `${headingOffset.toFixed(2)}px`);
    hero.style.setProperty("--hero-scroll-opacity", (1 - smoothRange(progress, 0.03, 0.2)).toFixed(4));
    hero.style.setProperty("--hero-overlay-darkness", (darkness * 0.94).toFixed(4));
    hero.style.setProperty("--hero-video-scale", (1 + 0.025 * videoScale).toFixed(4));
    hero.style.setProperty("--hero-transition-opacity", transitionOpacity.toFixed(4));
    hero.style.setProperty("--hero-nav-backdrop", smoothRange(progress, 0.02, 0.18).toFixed(4));
    hero.dataset.scrollProgress = progress.toFixed(4);
    hero.dataset.scrollStage = progress < 0.1
      ? "initial"
      : progress < 0.72
        ? "work"
        : progress < 0.92
          ? "transition"
          : "final";

    navigation?.classList.toggle("is-scrolled", window.scrollY > 24);
    updateActiveNavigation();
    setCopyState(introCopy, activeScene === "intro" ? 1 : 0);
    setCopyState(workCopy, activeScene === "work" ? 1 : 0);
    updateLinkAvailability();
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollProgress);
  };

  projectsCta?.addEventListener("click", (event) => {
    event.preventDefault();
    document.documentElement.classList.add("is-direct-anchor");
    window.location.hash = projectsCta.hash;

    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("is-direct-anchor");
    });
  });

  introVideo.addEventListener("loadeddata", () => {
    hero.classList.add("hero-video-ready");
  });
  introVideo.addEventListener("error", showFallback);
  workVideo.addEventListener("error", () => {
    requestedScene = "intro";
    applyScene("intro");
    playVideo(introVideo);
  });

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroIsVisible = entry.isIntersecting;

      if (!heroIsVisible) {
        introVideo.pause();
        workVideo.pause();
        return;
      }

      playVideo(activeScene === "work" ? workVideo : introVideo);
    }, { threshold: 0.01 });

    heroObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      introVideo.pause();
      workVideo.pause();
      return;
    }

    if (heroIsVisible) playVideo(activeScene === "work" ? workVideo : introVideo);
  });

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);

  applyScene("intro");
  updateScrollProgress();

  if (reducedMotion) {
    introVideo.pause();
    workVideo.pause();
  } else {
    playVideo(introVideo).then((started) => {
      if (!started) {
        hero.classList.add("hero-video-autoplay-blocked");
        showFallback();
      }
    });
  }
})();
