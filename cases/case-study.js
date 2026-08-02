(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector("[data-case-theme]");
  const themeIcon = themeButton?.querySelector(".theme-icon");
  const themeLabel = themeButton?.querySelector(".theme-label");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const THEME_KEY = "gerlach-theme";

  function applyTheme(theme) {
    const isLight = theme === "light";
    root.classList.toggle("light-mode", isLight);
    root.classList.toggle("dark-mode", !isLight);
    body.classList.toggle("light-mode", isLight);
    body.classList.toggle("dark-mode", !isLight);
    themeColor?.setAttribute("content", isLight ? "#f5f4f8" : "#090b10");
  }

  function updateThemeControl() {
    if (!themeButton) return;
    const isDark = body.classList.contains("dark-mode");
    const label = window.GerlachLanguage?.t(isDark ? "theme.light" : "theme.dark")
      || (isDark ? "Switch to light mode" : "Switch to dark mode");
    themeButton.setAttribute("aria-label", label);
    if (themeIcon) themeIcon.textContent = isDark ? "☀" : "☾";
    if (themeLabel) themeLabel.textContent = label;
  }

  function initTheme() {
    let storedTheme = "dark";
    try {
      storedTheme = window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      storedTheme = "dark";
    }
    applyTheme(storedTheme);
    updateThemeControl();

    themeButton?.addEventListener("click", () => {
      const nextTheme = body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        window.localStorage.setItem(THEME_KEY, nextTheme);
      } catch {
        // Theme switching still works when storage is unavailable.
      }
      updateThemeControl();
    });
  }

  function initViewSwitcher() {
    const tablist = document.querySelector("[data-case-views]");
    if (!tablist) return;

    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

    function activate(tab, updateHash = true) {
      tabs.forEach((item, index) => {
        const isActive = item === tab;
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
        if (panels[index]) panels[index].hidden = !isActive;
      });

      if (updateHash) {
        history.replaceState(null, "", `#${tab.dataset.caseView}`);
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === index) return;
        event.preventDefault();
        activate(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });

    const requested = location.hash.slice(1);
    const initial = tabs.find((tab) => tab.dataset.caseView === requested) || tabs[0];
    activate(initial, false);
  }

  initTheme();
  initViewSwitcher();
  document.addEventListener("languagechange", updateThemeControl);
})();
