import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const source = await readFile(new URL("../portfolio-translations.js", import.meta.url), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(source, context);
const translations = context.window.pageTranslations;

test("portfolio defaults to English and loads translations before the engine", () => {
  assert.match(html, /<html lang="en"/);
  assert.match(html, /<script src="portfolio-translations\.js"><\/script>\s*<script src="language\.js"><\/script>/s);
});

test("portfolio exposes the approved flag controls", () => {
  assert.match(html, /data-language="en"[^>]*>\s*<span[^>]*>🇬🇧<\/span> EN/s);
  assert.match(html, /data-language="da"[^>]*>\s*<span[^>]*>🇩🇰<\/span> DA/s);
});

test("every portfolio translation hook exists in both dictionaries", () => {
  const textKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
  const attrKeys = [...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((match) =>
    match[1].split(";").map((pair) => pair.split(":")[1]),
  );
  for (const key of new Set([...textKeys, ...attrKeys])) {
    assert.equal(typeof translations.en[key], "string", `Missing English key: ${key}`);
    assert.equal(typeof translations.da[key], "string", `Missing Danish key: ${key}`);
  }
});

test("portfolio dictionary contains the approved core copy", () => {
  assert.equal(translations.en["hero.heading"], "Web, UX and frontend with a technical background");
  assert.equal(translations.da["hero.heading"], "Web, UX og frontend med teknisk baggrund");
  assert.equal(translations.en["facts.backgroundValue"], "Qualified IT support specialist and currently studying Multimedia Design");
});

test("every project card translates its visible type and supporting copy", () => {
  const typeKeys = [...html.matchAll(/<p class="project-type"(?: data-i18n="([^"]+)")?>/g)]
    .map((match) => match[1]);

  assert.deepEqual(typeKeys, [
    "lg.type",
    "studymate.type",
    "life.type",
    "forni.type",
    "blade.type",
    "aquashield.type",
    "todo.type",
  ]);
  assert.match(html, /data-i18n="life\.placeholderLabel">In development</);
  assert.equal(translations.en["life.placeholderLabel"], "In development");
  assert.equal(translations.da["life.placeholderLabel"], "Under udvikling");
  assert.equal(translations.en["studymate.type"], "AI prototype");
  assert.equal(translations.da["studymate.type"], "AI-prototype");
  assert.equal(translations.da["studymate.placeholderLabel"], "Næsten klar");
  assert.equal(translations.da["lg.type"], "Kundewebsite");
  assert.equal(translations.da["lg.role"], "Webdesign, frontend og indholdsstruktur");
  assert.equal(translations.da["blade.type"], "JavaScript-spil");
  assert.equal(translations.da["blade.role"], "Spillogik og frontend");
  assert.equal(translations.en["aquashield.type"], "School project");
  assert.equal(translations.da["aquashield.type"], "Skoleprojekt");
  assert.equal(translations.da["aquashield.role"], "Frontendudvikling, interaktionsdesign og UX-writing");
  assert.equal(translations.en["materials.schoolCase"], "School case");
  assert.equal(translations.da["materials.schoolCase"], "Skolecase");
  assert.equal(translations.da["todo.type"], "Frontend-øvelse");
});

test("mobile navigation keeps language and theme controls compact", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));
  assert.match(mobile, /\.nav-actions\s*\{[^}]*grid-column:\s*2/s);
  assert.match(mobile, /\.theme-label\s*\{[^}]*display:\s*none/s);
  assert.match(mobile, /\.theme-toggle\s*\{[^}]*width:\s*44px/s);
});
