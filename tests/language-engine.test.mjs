import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const sourceUrl = new URL("../language.js", import.meta.url);

function element(dataset = {}) {
  const attributes = new Map();
  const listeners = new Map();
  return {
    dataset,
    textContent: "Original",
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(name, callback) { listeners.set(name, callback); },
    click() { listeners.get("click")?.(); },
  };
}

async function runLanguageEngine({ stored = null, storageThrows = false, translations } = {}) {
  const buttons = { en: element({ language: "en" }), da: element({ language: "da" }) };
  const textElement = element({ i18n: "greeting" });
  const attributeElement = element({ i18nAttr: "aria-label:label" });
  const events = [];
  const storage = {
    getItem() { if (storageThrows) throw new Error("blocked"); return stored; },
    setItem(key, value) { if (storageThrows) throw new Error("blocked"); stored = value; },
  };
  const document = {
    readyState: "complete",
    documentElement: { lang: "" },
    querySelectorAll(selector) {
      if (selector === "[data-language]") return [buttons.en, buttons.da];
      if (selector === "[data-i18n]") return [textElement];
      if (selector === "[data-i18n-attr]") return [attributeElement];
      return [];
    },
    addEventListener() {},
    dispatchEvent(event) { events.push(event); },
  };
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  const window = {
    localStorage: storage,
    pageTranslations: translations ?? {
      en: { greeting: "Hello {name}", label: "English label", fallback: "English fallback" },
      da: { greeting: "Hej {name}", label: "Dansk label" },
    },
  };
  const context = vm.createContext({ window, document, CustomEvent, console });
  vm.runInContext(await readFile(sourceUrl, "utf8"), context);
  return { api: window.GerlachLanguage, buttons, document, events, textElement, attributeElement };
}

test("English is the default and invalid values fall back to English", async () => {
  assert.equal((await runLanguageEngine()).api.getLanguage(), "en");
  assert.equal((await runLanguageEngine({ stored: "fr" })).api.getLanguage(), "en");
});

test("a valid Danish preference is restored", async () => {
  assert.equal((await runLanguageEngine({ stored: "da" })).api.getLanguage(), "da");
});

test("translations interpolate and fall back to English", async () => {
  const app = await runLanguageEngine();
  app.api.setLanguage("da");
  assert.equal(app.api.t("greeting", { name: "Martin" }), "Hej Martin");
  assert.equal(app.api.t("fallback"), "English fallback");
});

test("storage failures do not stop current-page switching", async () => {
  const app = await runLanguageEngine({ storageThrows: true });
  assert.doesNotThrow(() => app.api.setLanguage("da"));
  assert.equal(app.api.getLanguage(), "da");
});

test("language changes update DOM state and dispatch an event", async () => {
  const app = await runLanguageEngine();
  app.api.setLanguage("da");
  assert.equal(app.document.documentElement.lang, "da");
  assert.equal(app.buttons.da.getAttribute("aria-pressed"), "true");
  assert.equal(app.buttons.en.getAttribute("aria-pressed"), "false");
  assert.equal(app.textElement.textContent, "Hej {name}");
  assert.equal(app.attributeElement.getAttribute("aria-label"), "Dansk label");
  assert.equal(app.events.at(-1).detail.language, "da");
});
