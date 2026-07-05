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
  assert.match(html, /Qualified IT support specialist and currently studying Multimedia Design/);
});

test("every project has its agreed role and accent class", () => {
  const projects = [
    ["StudyMate AI", "project-card--studymate", "Product idea, UI design, frontend, backend and AI architecture"],
    ["LG Bio Capital Partners", "project-card--lg", "Web design, frontend and content structure"],
    ["LifeScienceNextGen", "project-card--lifescience", "Information architecture, frontend and signup flow"],
    ["Forni Pizza Foodtrailer", "project-card--forni", "Web design and frontend"],
    ["Blade Rhythm", "project-card--blade", "Game logic and frontend"],
    ["AquaShield", "project-card--aquashield", "Frontend development, interaction design and UX writing"],
    ["Todo-liste webapp", "project-card--todo", "JavaScript and frontend"],
  ];

  for (const [title, className, role] of projects) {
    const article = projectArticle(title);
    assert.match(article, new RegExp(className));
    assert.match(article, /class="project-role"/);
    assert.match(article, new RegExp(role));
  }
});

test("the five technical projects expose verified GitHub links", () => {
  const links = [
    ["StudyMate AI", "https://github.com/martincgerlach/StudymateAI"],
    ["Blade Rhythm", "https://github.com/martincgerlach/Blade-Rhythm"],
    ["Todo-liste webapp", "https://github.com/martincgerlach/eksperimenter"],
    ["LifeScienceNextGen", "https://github.com/martincgerlach/life-science-nextgen"],
    ["AquaShield", "https://github.com/martincgerlach/AquaShield"],
  ];

  for (const [title, href] of links) {
    const article = projectArticle(title);
    const anchor = article.match(new RegExp(`<a[^>]*href="${href}"[^>]*>View code</a>`))?.[0];
    assert.ok(anchor, `${title} GitHub link is missing`);
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }

  assert.doesNotMatch(projectArticle("LG Bio Capital Partners"), />View code</);
  assert.doesNotMatch(projectArticle("Forni Pizza Foodtrailer"), />View code</);
});

test("case accent and action hooks are defined without a new layout system", () => {
  assert.match(css, /\.profile-facts\s*\{/);
  assert.match(css, /\.project-role\s*\{/);
  assert.match(css, /\.project-actions\s*\{/);

  for (const modifier of ["studymate", "lg", "lifescience", "forni", "blade", "aquashield", "todo"]) {
    assert.match(css, new RegExp(`\\.project-card--${modifier}\\s*\\{[^}]*--project-accent:`, "s"));
  }
});

test("AquaShield exposes live project and school case links", () => {
  const article = projectArticle("AquaShield");
  assert.match(article, /href="https:\/\/martincgerlach\.github\.io\/AquaShield\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(article, /href="https:\/\/github\.com\/martincgerlach\/AquaShield"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /data-i18n="materials\.schoolCase">School case</);
  assert.match(html, /href="https:\/\/martincgerlach\.github\.io\/portfolio-eksamen\/cases\/t04-aquashield\.html"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
});

test("mobile rules compact navigation and retain only the portrait visual", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));

  assert.match(mobile, /\.main-nav\s*\{[^}]*grid-template-columns:\s*1fr auto/s);
  assert.match(mobile, /\.main-nav ul\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(mobile, /\.hero-visual\s*\{[^}]*max-width:\s*240px/s);
  assert.match(mobile, /\.portrait-card img\s*\{[^}]*aspect-ratio:\s*1/s);
  assert.match(mobile, /\.identity-card\s*\{[^}]*display:\s*none/s);
});

test("tech stack section uses honest levels and avoids fake skill scoring", () => {
  const sectionStart = html.indexOf('<section id="faerdigheder"');
  const sectionEnd = html.indexOf("</section>", sectionStart);
  const section = html.slice(sectionStart, sectionEnd);

  assert.match(section, /Tech Stack &amp; Tools|Tech Stack & Tools/);
  assert.match(section, /Comfortable/);
  assert.match(section, /Experience/);
  assert.match(section, /Learning/);
  assert.match(section, /Improving/);
  assert.match(section, /Building with/);
  assert.match(section, /StudyMate AI/);
  assert.match(section, /Cloudflare - DNS, SSL and domain setup for personal web projects/);
  assert.doesNotMatch(section, /expert/i);
  assert.doesNotMatch(section, /progress/i);
  assert.doesNotMatch(section, /\d+%/);
  assert.doesNotMatch(section, /Vercel|Netlify/);
});

test("tech stack keeps project-connected technologies visible", () => {
  const expected = [
    "HTML5",
    "CSS3",
    "JavaScript",
    "Responsive Design",
    "DOM Manipulation",
    "Fetch API",
    "JSON",
    "REST APIs",
    "Node.js",
    "Express.js",
    "OpenAI API",
    "Prompt Engineering",
    "AI UX",
    "Multi-Agent Architecture",
    "Knowledge Base Systems",
    "Figma",
    "Adobe Photoshop",
    "Adobe Premiere Pro",
    "Git",
    "GitHub",
    "VS Code",
    "npm",
    "Thunder Client / Postman",
    "Cloudflare",
    "GitHub Pages",
  ];

  for (const item of expected) {
    assert.match(html, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(css, /\.tech-stack-grid\s*\{/);
  assert.match(css, /\.tech-card\s*\{/);
  assert.match(css, /\.tech-level\s*\{/);
  assert.match(css, /\.tech-used\s*\{/);
});
