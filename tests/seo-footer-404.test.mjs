import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const translationSource = await readFile(new URL("../portfolio-translations.js", import.meta.url), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(translationSource, context);
const translations = context.window.pageTranslations;

function pngDimensions(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("the compact footer contains only the three requested contact routes", () => {
  const footer = html.slice(html.indexOf('<footer class="site-footer"'), html.indexOf("</footer>") + 9);

  assert.match(footer, /href="mailto:martin\.gerlach\.2950@gmail\.com"/);
  assert.match(footer, /href="https:\/\/github\.com\/martincgerlach"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(footer, /href="https:\/\/www\.linkedin\.com\/in\/martin-christoffer-gerlach-68272a21a\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.equal((footer.match(/<a\b/g) ?? []).length, 3);
  assert.doesNotMatch(footer, /Martin Gerlach|Frontend Developer|Open to student roles|No tracking|Back to top/);
  assert.doesNotMatch(css, /\.home-page \.footer-profile\s*\{|\.home-page \.footer-meta\s*\{/);
  assert.equal(translations.da["footer.linksLabel"], "Kontaktlinks");
});

test("credential links clearly download the two public CV PDFs", () => {
  const materials = html.slice(html.indexOf('<section id="materiale"'), html.indexOf("</section>", html.indexOf('<section id="materiale"')));

  for (const [name, key] of [
    ["CV_Martin_Gerlach_DA.pdf", "materials.danishCvLabel"],
    ["CV_Martin_Gerlach_EN.pdf", "materials.englishCvLabel"],
  ]) {
    assert.match(materials, new RegExp(`href="${name}"[^>]*type="application/pdf"[^>]*download[^>]*data-i18n-attr="aria-label:${key}"`));
  }
  assert.equal((materials.match(/PDF · Download/g) ?? []).length, 2);
  assert.doesNotMatch(`${html}\n${translationSource}`, /certificate|uddannelsesbevis|svendebrev/i);
});

test("homepage SEO and social metadata follow the active language", () => {
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(html, /<meta name="author" content="Martin Gerlach"/);
  assert.match(html, /<meta property="og:site_name" content="GerlachDesign"/);
  assert.match(html, /<meta property="og:locale" content="en_GB" data-i18n-attr="content:meta\.locale"/);
  assert.match(html, /<meta property="og:title"[^>]*data-i18n-attr="content:meta\.title"/);
  assert.match(html, /<meta property="og:description"[^>]*data-i18n-attr="content:meta\.socialDescription"/);
  assert.match(html, /<meta property="og:image:alt"[^>]*data-i18n-attr="content:meta\.socialImageAlt"/);
  assert.match(html, /<meta name="twitter:title"[^>]*data-i18n-attr="content:meta\.title"/);
  assert.match(html, /<meta name="twitter:description"[^>]*data-i18n-attr="content:meta\.socialDescription"/);
  assert.match(html, /<meta name="twitter:image:alt"[^>]*data-i18n-attr="content:meta\.socialImageAlt"/);

  assert.equal(translations.en["meta.locale"], "en_GB");
  assert.equal(translations.da["meta.locale"], "da_DK");
});

test("case studies expose complete indexable social metadata", async () => {
  for (const name of ["studymate-ai", "lg-bio-capital", "blade-rhythm", "aquashield"]) {
    const source = await readFile(new URL(`../cases/${name}.html`, import.meta.url), "utf8");
    assert.match(source, /<meta name="robots" content="index, follow"/);
    assert.match(source, /<meta name="author" content="Martin Gerlach"/);
    assert.match(source, /<meta name="theme-color" content="#07100f"/);
    assert.match(source, new RegExp(`<meta property="og:url" content="https://gerlachdesign\\.dk/cases/${name}\\.html"`));
    assert.match(source, /<meta property="og:image:alt"/);
    assert.match(source, /<meta name="twitter:card" content="summary_large_image"/);
    assert.match(source, /<meta name="twitter:title"/);
    assert.match(source, /<meta name="twitter:description"/);
    assert.match(source, /<meta name="twitter:image"/);
    assert.match(source, /<link rel="apple-touch-icon" sizes="180x180" href="\.\.\/apple-touch-icon\.png"/);
  }
});

test("favicon and social assets use the expected dimensions", async () => {
  const touchIcon = await readFile(new URL("../apple-touch-icon.png", import.meta.url));
  const socialPreview = await readFile(new URL("../social-preview.png", import.meta.url));

  assert.deepEqual(pngDimensions(touchIcon), { width: 180, height: 180 });
  assert.deepEqual(pngDimensions(socialPreview), { width: 1200, height: 630 });
  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon\.png"/);
});

test("the custom 404 page is bilingual, theme-aware and index-safe", async () => {
  await assert.doesNotReject(access(new URL("../404.html", import.meta.url)));
  const notFound = await readFile(new URL("../404.html", import.meta.url), "utf8");

  assert.match(notFound, /<meta name="robots" content="noindex, follow"/);
  assert.match(notFound, /data-i18n="error\.heading">Page not found/);
  assert.match(notFound, /data-i18n="error\.text">The page may have moved or the link may be outdated\./);
  assert.match(notFound, /href="index\.html"[^>]*data-i18n="error\.home"/);
  assert.match(notFound, /href="index\.html#projekter"[^>]*data-i18n="error\.projects"/);
  assert.match(notFound, /data-language="en"/);
  assert.match(notFound, /id="toggle-theme"/);
  assert.match(notFound, /portfolio-translations\.js/);
  assert.match(notFound, /language\.js/);
  assert.match(css, /\.error-page \.error-main\s*\{/);

  for (const language of ["en", "da"]) {
    for (const key of ["error.metaTitle", "error.heading", "error.text", "error.home", "error.projects"]) {
      assert.equal(typeof translations[language][key], "string", `Missing ${language} ${key}`);
    }
  }
});
