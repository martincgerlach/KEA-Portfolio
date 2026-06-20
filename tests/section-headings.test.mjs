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
    ["Portfolio", "Selected projects", "A selection of websites, frontend projects and design cases showing how I work with structure, user experience and code."],
    ["Profile", "About me", "Hi, I'm Martin. I'm 22 and a qualified IT support specialist."],
    ["What I work with", "Skills", "The areas and tools I use in my projects and want to keep developing."],
    ["Applications", "CV and material", "Documents and cases that support my CV and applications."],
  ];

  for (const [label, title, copy] of expected) {
    assert.match(html, new RegExp(`<p class="section-label"[^>]*>${label}</p>\\s*<h2[^>]*>${title}</h2>`, "s"));
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
