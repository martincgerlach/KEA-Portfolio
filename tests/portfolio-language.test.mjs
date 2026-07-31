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
  assert.match(html, /<script src="portfolio-translations\.js\?v=20260731-1"><\/script>\s*<script src="language\.js\?v=20260727-1"><\/script>\s*<script src="hero-video\.js\?v=20260731-1"><\/script>/s);
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
  assert.equal(translations.en["hero.heading"], "Martin Gerlach");
  assert.equal(translations.da["hero.heading"], "Martin Gerlach");
  assert.equal(translations.en["hero.role"], "SOFTWARE DEVELOPER • AI BUILDER • UX DESIGNER");
  assert.equal(translations.en["hero.intro"], "I build digital experiences that are intelligent, intuitive and impactful.");
  assert.equal(translations.en["hero.projectsCta"], "View my work");
  assert.equal(translations.en["hero.aboutCta"], "About me");
  assert.equal(translations.en["hero.workingHeading"], "I turn ideas into working digital products.");
  assert.equal(translations.da["hero.workingLabel"], "Fra idé til interface");
  assert.equal(translations.en["hero.discover"], "Discover my work");
  assert.equal(translations.da["hero.scroll"], "Scroll for at udforske");
  assert.equal(translations.da["hero.discover"], "Udforsk mit arbejde");
  assert.equal(translations.en["about.frontendHeading"], "Frontend development");
});

test("every project card translates its visible type and supporting copy", () => {
  const typeKeys = [...html.matchAll(/<p class="project-type"(?: data-i18n="([^"]+)")?>/g)]
    .map((match) => match[1]);

  assert.deepEqual(typeKeys, [
    "studymate.type",
    "lg.type",
    "blade.type",
    "aquashield.type",
    "forni.type",
    "story.type",
  ]);
  assert.equal(translations.en["studymate.type"], "Featured AI Product");
  assert.equal(translations.da["studymate.type"], "Udvalgt AI-produkt");
  assert.equal(translations.da["lg.type"], "Kundewebsite");
  assert.equal(translations.da["blade.type"], "JavaScript-spil");
  assert.equal(translations.en["aquashield.type"], "School project");
  assert.equal(translations.da["aquashield.type"], "Skoleprojekt");
  assert.equal(translations.en["materials.heading"], "CV");
  assert.equal(translations.da["materials.heading"], "CV");
  assert.doesNotMatch(html, /data-i18n="materials\.schoolCase"/);
  assert.doesNotMatch(html, /project-card--lifescience|project-card--todo/);
});

test("technology category groups are translated", () => {
  assert.equal(translations.en["tech.frontendHeading"], "Core frontend");
  assert.equal(translations.da["tech.backendHeading"], "Applikation og backend");
  assert.equal(translations.en["tech.workflowHeading"], "Workflow and deployment");
});

test("mobile navigation keeps language and theme controls compact", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));
  assert.match(mobile, /\.nav-actions\s*\{[^}]*grid-column:\s*2/s);
  assert.match(mobile, /\.theme-toggle\s*\{[^}]*width:\s*44px/s);
  assert.match(css, /\.main-nav \.theme-label\s*\{[^}]*clip-path:\s*inset\(50%\)/s);
});
