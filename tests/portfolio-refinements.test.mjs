import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

function projectArticle(title) {
  const titleIndex = html.indexOf(`<h3>${title}</h3>`);
  assert.notEqual(titleIndex, -1, `${title} is missing`);

  const articleStart = html.lastIndexOf("<article", titleIndex);
  const articleEnd = html.indexOf("</article>", titleIndex);
  return html.slice(articleStart, articleEnd + "</article>".length);
}

test("profile facts appear after projects and before the about section", () => {
  const projects = html.indexOf('<section id="projekter"');
  const facts = html.indexOf('class="profile-facts"');
  const about = html.indexOf('<section id="om-mig"');

  assert.ok(projects < facts && facts < about);
  assert.doesNotMatch(html.slice(0, html.indexOf("</header>")), /hero-facts/);
  assert.match(html, /Uddannet IT-supporter og studerer til multimediedesigner/);
});

test("every project has its agreed role and accent class", () => {
  const projects = [
    ["LG Bio Capital Partners", "project-card--lg", "Webdesign, frontend og content structure"],
    ["LifeScienceNextGen", "project-card--lifescience", "Informationsarkitektur, frontend og signup-flow"],
    ["Forni Pizza Foodtrailer", "project-card--forni", "Webdesign og frontend"],
    ["Blade Rhythm", "project-card--blade", "Game logic og frontend"],
    ["Stream Deck UI redesign", "project-card--stream", "UI-analyse og redesign"],
    ["Todo-liste webapp", "project-card--todo", "JavaScript og frontend"],
  ];

  for (const [title, className, role] of projects) {
    const article = projectArticle(title);
    assert.match(article, new RegExp(className));
    assert.match(article, /class="project-role"/);
    assert.match(article, new RegExp(role));
  }
});

test("only the three technical projects expose verified GitHub links", () => {
  const links = [
    ["Blade Rhythm", "https://github.com/martincgerlach/Blade-Rhythm"],
    ["Todo-liste webapp", "https://github.com/martincgerlach/eksperimenter"],
    ["LifeScienceNextGen", "https://github.com/martincgerlach/life-science-nextgen"],
  ];

  for (const [title, href] of links) {
    const article = projectArticle(title);
    const anchor = article.match(new RegExp(`<a[^>]*href="${href}"[^>]*>Se kode</a>`))?.[0];
    assert.ok(anchor, `${title} GitHub link is missing`);
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }

  assert.doesNotMatch(projectArticle("LG Bio Capital Partners"), />Se kode</);
  assert.doesNotMatch(projectArticle("Forni Pizza Foodtrailer"), />Se kode</);
  assert.doesNotMatch(projectArticle("Stream Deck UI redesign"), />Se kode</);
});

test("case accent and action hooks are defined without a new layout system", () => {
  assert.match(css, /\.profile-facts\s*\{/);
  assert.match(css, /\.project-role\s*\{/);
  assert.match(css, /\.project-actions\s*\{/);

  for (const modifier of ["lg", "lifescience", "forni", "blade", "stream", "todo"]) {
    assert.match(css, new RegExp(`\\.project-card--${modifier}\\s*\\{[^}]*--project-accent:`, "s"));
  }
});

test("mobile rules compact navigation and retain only the portrait visual", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));

  assert.match(mobile, /\.main-nav\s*\{[^}]*grid-template-columns:\s*1fr auto/s);
  assert.match(mobile, /\.main-nav ul\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(mobile, /\.hero-visual\s*\{[^}]*max-width:\s*240px/s);
  assert.match(mobile, /\.portrait-card img\s*\{[^}]*aspect-ratio:\s*1/s);
  assert.match(mobile, /\.identity-card\s*\{[^}]*display:\s*none/s);
});
