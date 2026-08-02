import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const translations = await readFile(new URL("../portfolio-translations.js", import.meta.url), "utf8");

const cases = {
  lg: await readFile(new URL("../cases/lg-bio-capital.html", import.meta.url), "utf8"),
  blade: await readFile(new URL("../cases/blade-rhythm.html", import.meta.url), "utf8"),
  playnext: await readFile(new URL("../cases/playnext.html", import.meta.url), "utf8"),
};

test("the bilingual process section sits between About and Tech", () => {
  const about = html.indexOf('<section id="om-mig"');
  const process = html.indexOf('<section id="proces"');
  const tech = html.indexOf('<section id="faerdigheder"');
  const section = html.slice(process, tech);

  assert.ok(about < process && process < tech);
  assert.match(section, /<ol class="process-flow"/);
  assert.equal((section.match(/<li class="process-step">/g) ?? []).length, 4);
  for (const key of ["research", "design", "build", "iterate"]) {
    assert.match(section, new RegExp(`data-i18n="process\\.${key}Heading"`));
    assert.match(section, new RegExp(`data-i18n="process\\.${key}Text"`));
  }

  assert.match(translations, /"process\.heading": "How I work"/);
  assert.match(translations, /"process\.heading": "Sådan arbejder jeg"/);
  assert.match(translations, /Understanding users, goals and technical requirements\./);
  assert.match(translations, /Forstå brugere, mål og tekniske krav\./);
});
test("the process flow stays compact and responsive", () => {
  assert.match(css, /\.home-page \.section-process\s*\{/);
  assert.match(css, /\.home-page \.process-flow\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*980px\)[\s\S]*\.home-page \.process-flow\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*680px\)[\s\S]*\.home-page \.process-flow\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.doesNotMatch(html.slice(html.indexOf('<section id="proces"'), html.indexOf('<section id="faerdigheder"')), /button|href=/i);
});

test("LG Bio Capital clearly separates client requirements and delivery", () => {
  assert.match(cases.lg, /Live client project/);
  assert.match(cases.lg, /data-i18n="summary\.contributionHeading">My contribution/);
  assert.match(cases.lg, /data-i18n="context\.heading">Client context and requirements/);
  assert.match(cases.lg, /data-i18n="result\.heading">Delivered result and reflection/);
  assert.match(cases.lg, /No conversion claims or client metrics are included/);
});

test("Blade Rhythm is presented as an individual learning project", () => {
  assert.match(cases.blade, /Personal creative-coding project/);
  assert.match(cases.blade, /data-i18n="summary\.contributionHeading">My contribution/);
  assert.match(cases.blade, /data-i18n="implementation\.heading">Implementation and challenges/);
  assert.match(cases.blade, /Status: Planned — external playtesting has not yet been completed\./);
});

test("PlayNext documents its product architecture and honest prototype limits", () => {
  assert.match(cases.playnext, /Bilingual AI decision product · Functional local prototype/);
  assert.match(cases.playnext, /data-i18n="summary\.contributionHeading">My contribution/);
  assert.match(cases.playnext, /data-i18n="architecture\.heading">Architecture and AI boundaries/);
  assert.match(cases.playnext, /AI extracts preferences and may rerank only an allowlisted shortlist; it cannot invent titles or metadata\./);
  assert.match(cases.playnext, /Production deployment is not published yet/);
  assert.match(cases.playnext, /External usability testing is planned/);
});
