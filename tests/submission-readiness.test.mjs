import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const translations = await readFile(new URL("../portfolio-translations.js", import.meta.url), "utf8");
const cvSource = await readFile(new URL("../scripts/generate_cvs.py", import.meta.url), "utf8");

test("homepage keeps three technical projects featured and groups client work below", () => {
  const cards = html.match(/<article class="[^"]*\bproject-card\b[^"]*">/g) ?? [];
  assert.equal(cards.length, 3);
  for (const title of ["StudyMate AI", "Blade Rhythm", "PlayNext"]) {
    assert.match(html, new RegExp(`<h3>${title}</h3>`));
  }
  for (const title of ["LG Bio Capital Partners", "Forni Pizza Foodtrailer"]) {
    assert.match(html, new RegExp(`<h4>${title}</h4>`));
  }
  assert.doesNotMatch(html, /Through My Lens|Through-my-lens/i);
  assert.doesNotMatch(html, /<h3>LifeScienceNextGen<\/h3>|<h3>Todo-liste webapp<\/h3>/);
});

test("submission metadata and indexability files are present", async () => {
  assert.match(html, /<title data-i18n="meta\.title">Martin Gerlach \| Frontend Developer, AI Builder &amp; UX Designer<\/title>/);
  assert.match(html, /<meta property="og:title" content="Martin Gerlach \| Frontend Developer, AI Builder & UX Designer"/);
  assert.match(html, /<meta name="twitter:title" content="Martin Gerlach \| Frontend Developer, AI Builder & UX Designer"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/gerlachdesign\.dk\/"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/gerlachdesign\.dk\/social-preview\.png"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  for (const file of ["social-preview.png", "robots.txt", "sitemap.xml"]) {
    await assert.doesNotReject(access(new URL(`../${file}`, import.meta.url)));
  }
});

test("both current CV files are compact one-page application PDFs", async () => {
  for (const name of ["CV_Martin_Gerlach_DA.pdf", "CV_Martin_Gerlach_EN.pdf"]) {
    const file = new URL(`../${name}`, import.meta.url);
    const bytes = await readFile(file);
    const fileStat = await stat(file);
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "%PDF");
    assert.ok(fileStat.size < 100 * 1024, `${name} should remain lightweight`);
    assert.match(bytes.toString("latin1"), /\/Count 1\b/);
  }
  assert.match(cvSource, /September 2024 - marts 2025/);
  assert.match(cvSource, /September 2024 - March 2025/);
  assert.doesNotMatch(cvSource, /MT Højgaard[\s\S]{0,180}(?:present|nu)/i);
  assert.match(cvSource, /Multimediedesignstuderende \| Frontend, AI-produkter & UX/);
  assert.match(cvSource, /Multimedia Design Student \| Frontend, AI Products & UX/);
  assert.match(cvSource, /OpenAI API, rollebaseret prompting og AI UX - anvendt i StudyMate AI/);
  assert.match(cvSource, /OpenAI API, role-based prompting and AI UX - applied in StudyMate AI/);
  assert.match(cvSource, /IT Support Trainee - MT Højgaard/);
  assert.doesNotMatch(cvSource, /lærer gennem projekter|learning by building|currently learning/i);
});

test("the education certificate is not published by the portfolio", async () => {
  assert.doesNotMatch(html, /Uddannelsesbevis\.pdf|Trade certificate|Svendebrev|IT Support Specialist Certificate/i);
  assert.doesNotMatch(html, /(?:href|src)="[^"]*(?:certificate|uddannelsesbevis|svendebrev)/i);
  assert.doesNotMatch(translations, /materials\.certificate(?:Link|Download)|Trade certificate|Svendebrev|IT Support Specialist Certificate/i);
  for (const name of ["Uddannelsesbevis.pdf", "billede af svendebrev.jpg"]) {
    await assert.rejects(access(new URL(`../${name}`, import.meta.url)));
  }
});

test("all four portfolio case studies remain evidence-led", async () => {
  const names = ["studymate-ai", "lg-bio-capital", "blade-rhythm", "playnext"];
  for (const name of names) {
    const source = await readFile(new URL(`../cases/${name}.html`, import.meta.url), "utf8");
    assert.match(source, /<link rel="canonical"/);
    assert.match(source, /Problem|Client context|Project concept/);
    assert.match(source, /Implementation|Current architecture|Architecture and AI boundaries|Design direction/i);
    assert.match(source, /Testing|Delivered result and reflection/);
    assert.match(source, /What worked well/);
  }
});

test("theme control persists a real theme without misusing pressed state", () => {
  assert.match(html, /const THEME_KEY = "gerlach-theme"/);
  assert.match(html, /window\.localStorage\.setItem\(THEME_KEY, nextTheme\)/);
  assert.doesNotMatch(html.match(/<button id="toggle-theme"[^>]*>/)?.[0] ?? "", /aria-pressed/);
});
