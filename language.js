(function () {
  "use strict";

  const STORAGE_KEY = "gerlach-language";
  const SUPPORTED = new Set(["en", "da"]);
  const translations = window.pageTranslations || { en: {}, da: {} };

  function readStoredLanguage() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.has(stored) ? stored : "en";
    } catch {
      return "en";
    }
  }

  let currentLanguage = readStoredLanguage();

  function interpolate(value, values = {}) {
    return value.replace(/\{(\w+)\}/g, (match, key) =>
      Object.hasOwn(values, key) ? String(values[key]) : match,
    );
  }

  function findTranslation(key, language = currentLanguage) {
    return translations[language]?.[key] ?? translations.en?.[key] ?? null;
  }

  function t(key, values = {}) {
    const value = findTranslation(key);
    if (typeof value !== "string") {
      console.warn(`Missing translation: ${key}`);
      return null;
    }
    return interpolate(value, values);
  }

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = findTranslation(element.dataset.i18n);
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      element.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attribute, key] = pair.split(":");
        const value = findTranslation(key);
        if (attribute && typeof value === "string") {
          element.setAttribute(attribute, value);
        }
      });
    });

    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === currentLanguage),
      );
    });
  }

  function setLanguage(language, options = {}) {
    currentLanguage = SUPPORTED.has(language) ? language : "en";
    if (options.persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, currentLanguage);
      } catch {
        // Current-page switching still works when storage is unavailable.
      }
    }

    applyTranslations();
    if (options.emit !== false) {
      document.dispatchEvent(new CustomEvent("languagechange", {
        detail: { language: currentLanguage },
      }));
    }
  }

  function init() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    setLanguage(currentLanguage, { persist: false, emit: false });
  }

  window.GerlachLanguage = {
    getLanguage: () => currentLanguage,
    setLanguage,
    t,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
