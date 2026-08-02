import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const translations = await readFile(new URL("../portfolio-translations.js", import.meta.url), "utf8");

const previews = new Map([
  ["lg-biocapital-preview.webp", 800],
  ["studymate-preview.webp", 900],
  ["forni-preview.webp", 900],
]);

test("project screenshots use optimized WebP assets with stable dimensions", async () => {
  for (const [name, height] of previews) {
    const fileUrl = new URL(`../${name}`, import.meta.url);
    const contents = await readFile(fileUrl);
    const fileStat = await stat(fileUrl);

    assert.equal(contents.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(contents.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(fileStat.size < 250 * 1024, `${name} must stay below 250 KB`);
    assert.match(
      html,
      new RegExp(`<img[^>]*src="${name.replace(".", "\\.")}"[^>]*loading="lazy"[^>]*decoding="async"[^>]*width="1440"[^>]*height="${height}"`),
    );
  }
});

test("PlayNext uses real lightweight desktop and mobile screenshots", async () => {
  for (const [name, width, height] of [
    ["playnext-preview.jpg", 1280, 720],
    ["playnext-mobile.jpg", 390, 844],
  ]) {
    const fileUrl = new URL(`../${name}`, import.meta.url);
    const contents = await readFile(fileUrl);
    const fileStat = await stat(fileUrl);

    assert.deepEqual([...contents.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    assert.ok(fileStat.size < 250 * 1024, `${name} must stay below 250 KB`);
    const source = name === "playnext-preview.jpg" ? html : await readFile(new URL("../cases/playnext.html", import.meta.url), "utf8");
    assert.match(source, new RegExp(`src="(?:\\.\\.\\/)?${name.replace(".", "\\.")}"[^>]*width="${width}"[^>]*height="${height}"`));
  }
});

test("LG Bio Capital thumbnail keeps the client portrait visible", () => {
  assert.match(css, /\.home-page \.secondary-project--lg img\s*\{[^}]*object-position:\s*left top/s);
});

test("project screenshot media preserves the full viewport", () => {
  assert.match(html, /class="project-media project-media--screenshot"/);
  assert.match(css, /\.project-media--screenshot\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10/s);
  assert.match(css, /\.project-media--screenshot img\s*\{[^}]*object-fit:\s*contain/s);
});

test("Stream Deck content and assets are removed", async () => {
  for (const source of [html, css, translations]) {
    assert.doesNotMatch(source, /Stream Deck|project-card--stream|stream\./i);
  }

  await assert.rejects(access(new URL("../efter-redesign.png", import.meta.url)));
  await assert.rejects(
    access(new URL("../Martin G – Personligt UI_UX-projekt (Stream Deck).pdf", import.meta.url)),
  );
});
