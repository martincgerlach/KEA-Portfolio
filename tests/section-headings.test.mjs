import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

function cssRule(selector, source = css) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
}

test("the four portfolio sections use the approved compact copy", () => {
  const expected = [
    ["Portfolio", "Udvalgte projekter", "Et udvalg af websites, frontend-projekter og designcases, der viser hvordan jeg arbejder med struktur, brugeroplevelse og kode."],
    ["Profil", "Om mig", "Hej, jeg hedder Martin. Jeg er 22 år og uddannet IT-supporter."],
    ["Det arbejder jeg med", "Kompetencer", "De områder og værktøjer jeg bruger i mine projekter og gerne vil udvikle videre."],
    ["Ansøgning", "CV og materiale", "Dokumenter og cases, der supplerer mit CV og mine ansøgninger."],
  ];

  for (const [label, title, copy] of expected) {
    assert.match(html, new RegExp(`<p class="section-label">${label}</p>\\s*<h2>${title}</h2>`, "s"));
    assert.match(html, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("section headings use one constrained content column", () => {
  const heading = cssRule(".section-heading");
  const title = cssRule(".section-heading h2");
  const paragraph = cssRule(".section-heading p:not(.section-label)");

  assert.match(heading, /max-width:\s*760px/);
  assert.doesNotMatch(heading, /display:\s*grid|grid-template-columns/);
  assert.match(title, /font-size:\s*clamp\(3rem,\s*5vw,\s*3\.75rem\)/);
  assert.match(paragraph, /max-width:\s*700px/);
  assert.match(paragraph, /margin-top:\s*1\.125rem/);
});

test("mobile section titles use the approved compact range", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));
  const title = cssRule(".section-heading h2", mobile);

  assert.match(title, /font-size:\s*clamp\(2\.125rem,\s*9vw,\s*2\.375rem\)/);
});
