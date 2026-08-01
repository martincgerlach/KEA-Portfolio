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

test("about section uses three concise focus areas without repeated profile facts", () => {
  const projects = html.indexOf('<section id="projekter"');
  const about = html.indexOf('<section id="om-mig"');
  const introduction = html.indexOf('data-i18n="about.intro"', about);
  const frontend = html.indexOf('data-i18n="about.frontendHeading"', about);
  const aboutEnd = html.indexOf('</section>', about);

  assert.ok(projects < about && about < introduction && introduction < frontend && frontend < aboutEnd);
  assert.doesNotMatch(html.slice(about, aboutEnd), /profile-facts|Professional direction|Academic direction/);
  assert.match(html, /AI and product UX/);
  assert.match(html, /Technical problem-solving/);
});

test("every featured project uses the compact image-led structure", () => {
  const projects = [
    ["StudyMate AI", "project-card--studymate", "cases/studymate-ai.html"],
    ["Blade Rhythm", "project-card--blade", "cases/blade-rhythm.html"],
    ["AquaShield", "project-card--aquashield", "cases/aquashield.html"],
  ];

  for (const [title, className, caseHref] of projects) {
    const article = projectArticle(title);
    assert.match(article, new RegExp(className));
    assert.match(article, /data-i18n="[^"]+\.description"/);
    assert.match(article, /class="tag-list"/);
    assert.ok((article.match(/<li(?:\s[^>]*)?>/g) ?? []).length <= 4);
    assert.match(article, new RegExp(`class="button button-primary" href="${caseHref.replace(".", "\\.")}"`));
    assert.doesNotMatch(article, /project-role|project-meta|project-proof|project-contribution/);
  }
});

test("project interactions stay restrained, keyboard-visible and motion-safe", () => {
  assert.match(css, /\.home-page \.project-card:focus-within\s*\{[^}]*translateY\(-3px\)/s);
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)[\s\S]*\.home-page \.project-card:hover \.project-media img[\s\S]*scale\(1\.025\)/s);
  assert.match(css, /\.home-page \.project-media img[^}]*transition:\s*transform 220ms ease/s);

  const reducedMotionBlocks = [...css.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g)]
    .map((match) => match[1])
    .join("\n");

  assert.match(reducedMotionBlocks, /\.home-page \.project-card:focus-within[\s\S]*transform:\s*none/s);
  assert.match(reducedMotionBlocks, /\.home-page \.project-card:hover \.project-media img[\s\S]*transform:\s*none/s);
});

test("the three featured technical projects expose verified GitHub links", () => {
  const links = [
    ["StudyMate AI", "https://github.com/martincgerlach/StudymateAI"],
    ["Blade Rhythm", "https://github.com/martincgerlach/Blade-Rhythm"],
    ["AquaShield", "https://github.com/martincgerlach/AquaShield"],
  ];

  for (const [title, href] of links) {
    const article = projectArticle(title);
    const anchor = article.match(new RegExp(`<a[^>]*href="${href}"[^>]*>View code</a>`))?.[0];
    assert.ok(anchor, `${title} GitHub link is missing`);
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }

  const lgTitle = html.indexOf("<h4>LG Bio Capital Partners</h4>");
  const lgArticle = html.slice(html.lastIndexOf("<article", lgTitle), html.indexOf("</article>", lgTitle));
  assert.match(lgArticle, /href="cases\/lg-bio-capital\.html"/);
  assert.doesNotMatch(lgArticle, />View code</);
});

test("new homepage hooks keep the layout in vanilla CSS", () => {
  assert.match(css, /\.project-actions\s*\{/);
  assert.match(css, /\.hero-scene-copy\s*\{/);
  assert.match(css, /\.tech-group-grid\s*\{/);
  assert.match(css, /\.tech-group-card\s*\{/);
  assert.match(css, /\.tech-badge-list\s*\{/);
  assert.match(css, /\.credentials-panel\s*\{/);
  assert.doesNotMatch(css, /\.project-role\s*\{|\.project-meta\s*\{/);
  assert.doesNotMatch(html, /React|Vue|Angular/);
});

test("AquaShield exposes live project and code links without a duplicate credentials link", () => {
  const article = projectArticle("AquaShield");
  assert.match(article, /href="https:\/\/martincgerlach\.github\.io\/AquaShield\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(article, /href="https:\/\/github\.com\/martincgerlach\/AquaShield"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /href="cases\/aquashield\.html"/);
  const materials = html.slice(html.indexOf('<section id="materiale"'), html.indexOf('</section>', html.indexOf('<section id="materiale"')));
  assert.doesNotMatch(materials, /AquaShield|cases\/aquashield\.html/);
});

test("mobile rules compact navigation and preserve the cinematic video hero", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));

  assert.match(mobile, /\.main-nav\s*\{[^}]*grid-template-columns:\s*1fr auto/s);
  assert.match(mobile, /\.main-nav ul\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(mobile, /\.home-page \.hero\s*\{[^}]*min-height:\s*160vh/s);
  assert.match(mobile, /\.home-page \.hero-video\s*\{[^}]*object-position:\s*6% center/s);
  assert.match(mobile, /\.hero-scene-copy--working\s*\{[^}]*bottom:\s*7\.2rem/s);
  assert.doesNotMatch(css, /\.hero-visual\s*\{|\.portrait-card\s*\{|\.identity-card\s*\{/);
});

test("tech stack uses concise categories instead of subjective levels", () => {
  const sectionStart = html.indexOf('<section id="faerdigheder"');
  const sectionEnd = html.indexOf("</section>", sectionStart);
  const section = html.slice(sectionStart, sectionEnd);

  assert.match(section, /Technologies I work with/);
  assert.match(section, /Core frontend/);
  assert.match(section, /Application and backend/);
  assert.match(section, /Workflow and deployment/);
  assert.doesNotMatch(section, /expert/i);
  assert.doesNotMatch(section, /progress/i);
  assert.doesNotMatch(section, /\d+%/);
  assert.doesNotMatch(section, /Comfortable|Experience|Improving|Building with|Currently learning/);
  assert.match(section, /Figma|Photoshop|Premiere Pro/);
  assert.match(section, /VS Code|Thunder Client/);
  assert.doesNotMatch(section, /Vercel|Netlify/);
});

test("tech stack keeps the approved technologies visible", () => {
  const expected = [
    "HTML",
    "CSS",
    "JavaScript",
    "Responsive Design",
    "DOM",
    "Fetch API",
    "JSON",
    "REST APIs",
    "Node.js",
    "Express",
    "OpenAI API",
    "Prompt Engineering",
    "AI UX",
    "Role-based AI Assistants",
    "Figma",
    "Photoshop",
    "Premiere Pro",
    "Git",
    "GitHub",
    "VS Code",
    "npm",
    "Cloudflare",
    "GitHub Pages",
    "Thunder Client",
  ];

  for (const item of expected) {
    assert.match(html, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(css, /\.tech-group-grid\s*\{/);
  assert.match(css, /\.tech-group-card\s*\{/);
  assert.match(css, /\.tech-badge-list\s*\{/);
});
