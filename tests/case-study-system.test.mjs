import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { access, readFile } from "node:fs/promises";

const caseIds = ["studymate", "lg", "blade", "playnext"];
const caseFiles = {
  studymate: "studymate-ai.html",
  lg: "lg-bio-capital.html",
  blade: "blade-rhythm.html",
  playnext: "playnext.html",
};

const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(caseFiles).map(async ([id, file]) => [
      id,
      await readFile(new URL(`../cases/${file}`, import.meta.url), "utf8"),
    ]),
  ),
);

const css = await readFile(new URL("../cases/case-study.css", import.meta.url), "utf8");
const translationSource = await readFile(new URL("../cases/case-translations.js", import.meta.url), "utf8");

test("all published cases use the shared case-study system", () => {
  for (const source of Object.values(sources)) {
    assert.match(source, /href="case-study\.css/);
    assert.match(source, /src="case-study\.js/);
    assert.match(source, /src="case-translations\.js/);
    assert.match(source, /class="case-site-header"/);
    assert.match(source, /class="main-nav"/);
    assert.match(source, /class="language-switcher"/);
    assert.match(source, /class="theme-toggle"[^>]*data-case-theme/);
    assert.match(source, /href="\.\.\/index\.html#faerdigheder"[^>]*data-i18n="common\.tech">Tech/);
    assert.match(source, /🇬🇧/);
    assert.match(source, /🇩🇰/);
    assert.doesNotMatch(source, /class="case-nav"|class="case-language"|class="case-theme-toggle"/);
    assert.match(source, /class="case-summary-new"/);
    assert.match(source, /class="case-next"/);
    assert.match(source, /class="case-footer"/);
    assert.match(source, /data-case-theme/);
    assert.match(source, /data-language="en"/);
    assert.match(source, /data-language="da"/);
  }
});

test("only StudyMate exposes the product and technical view switch", () => {
  assert.match(sources.studymate, /data-case-views/);
  assert.equal((sources.studymate.match(/role="tabpanel"/g) ?? []).length, 2);

  for (const id of ["lg", "blade", "playnext"]) {
    assert.doesNotMatch(sources[id], /data-case-views|role="tabpanel"/);
  }
});

test("every translation hook resolves in English and Danish", () => {
  const context = { window: {} };
  vm.runInNewContext(translationSource, context);

  for (const id of caseIds) {
    const dictionary = context.window.CaseStudyTranslations.forPage(id);
    const hooks = [
      ...sources[id].matchAll(/data-i18n="([^"]+)"/g),
      ...sources[id].matchAll(/data-i18n-attr="(?:[^:"]+:)?([^";]+)"/g),
    ].map((match) => match[1]);

    for (const language of ["en", "da"]) {
      for (const key of hooks) {
        assert.ok(dictionary[language][key], `${id}.${language}.${key} is missing`);
      }
    }
  }
});

test("case accents are restrained and project-specific", () => {
  assert.match(css, /\.case-page\[data-case="lg"\][^{]*\{[^}]*--case-accent:/s);
  assert.match(css, /\.case-page\[data-case="blade"\][^{]*\{[^}]*--case-accent:/s);
  assert.match(css, /\.case-page\[data-case="playnext"\][^{]*\{[^}]*--case-accent:/s);
  assert.doesNotMatch(css, /#54f0c0/i);
});

test("the shared case layout includes mobile and reduced-motion fallbacks", () => {
  assert.match(css, /\.case-hero-copy-new\s*\{[^}]*min-width:\s*0;/s);
  assert.match(css, /\.case-hero-new h1\s*\{[^}]*max-width:\s*100%;[^}]*font-size:\s*clamp\(3\.25rem, 5\.3vw, 5rem\);/s);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("case metadata and project progression stay intact", () => {
  const nextProjects = {
    studymate: "lg-bio-capital.html",
    lg: "blade-rhythm.html",
    blade: "playnext.html",
    playnext: "studymate-ai.html",
  };

  for (const [id, source] of Object.entries(sources)) {
    assert.match(source, /<link rel="canonical"/);
    assert.match(source, /property="og:title"/);
    assert.match(source, /name="twitter:card"/);
    assert.match(source, new RegExp(`class="case-next" href="${nextProjects[id]}`));
  }
});

test("removed or undocumented cases are not published", async () => {
  for (const file of ["aquashield.html", "forni.html", "through-my-lens.html"]) {
    await assert.rejects(access(new URL(`../cases/${file}`, import.meta.url)));
  }
});
