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

test("profile facts are integrated into the about section after its introduction", () => {
  const projects = html.indexOf('<section id="projekter"');
  const about = html.indexOf('<section id="om-mig"');
  const introduction = html.indexOf('data-i18n="about.intro"', about);
  const facts = html.indexOf('class="profile-facts"', about);
  const aboutEnd = html.indexOf('</section>', facts);

  assert.ok(projects < about && about < introduction && introduction < facts && facts < aboutEnd);
  assert.doesNotMatch(html.slice(0, html.indexOf("</header>")), /hero-facts/);
  assert.match(html, /Qualified IT support specialist and currently studying Multimedia Design/);
});

test("every featured project uses the compact evidence structure", () => {
  const projects = [
    ["StudyMate AI", "project-card--studymate", "cases/studymate-ai.html"],
    ["LG Bio Capital Partners", "project-card--lg", "cases/lg-bio-capital.html"],
    ["Blade Rhythm", "project-card--blade", "cases/blade-rhythm.html"],
    ["AquaShield", "project-card--aquashield", "cases/aquashield.html"],
  ];

  for (const [title, className, caseHref] of projects) {
    const article = projectArticle(title);
    assert.match(article, new RegExp(className));
    assert.match(article, /data-i18n="[^"]+\.description"/);
    assert.match(article, /class="project-proof"/);
    assert.match(article, /class="tag-list"/);
    assert.ok((article.match(/<li(?:\s[^>]*)?>/g) ?? []).length <= 4);
    assert.match(article, new RegExp(`class="button button-primary" href="${caseHref.replace(".", "\\.")}"`));
    assert.doesNotMatch(article, /project-role|project-meta/);
  }
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

  assert.doesNotMatch(projectArticle("LG Bio Capital Partners"), />View code</);
});

test("project and evidence hooks are defined without a new layout system", () => {
  assert.match(css, /\.profile-facts\s*\{/);
  assert.match(css, /\.project-actions\s*\{/);
  assert.match(css, /\.tech-evidence-list\s*\{/);
  assert.match(css, /\.tech-evidence-item\s*\{/);
  assert.match(css, /\.tech-project-links\s*\{/);
  assert.doesNotMatch(css, /\.project-role\s*\{|\.project-meta\s*\{/);

  for (const modifier of ["studymate", "lg", "blade", "aquashield"]) {
    assert.match(css, new RegExp(`\\.project-card--${modifier}\\s*\\{[^}]*--project-accent:`, "s"));
  }
});

test("AquaShield exposes live project and school case links", () => {
  const article = projectArticle("AquaShield");
  assert.match(article, /href="https:\/\/martincgerlach\.github\.io\/AquaShield\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(article, /href="https:\/\/github\.com\/martincgerlach\/AquaShield"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /data-i18n="materials\.schoolCase">School case</);
  assert.match(html, /href="cases\/aquashield\.html"/);
});

test("mobile rules compact navigation and preserve the cinematic video hero", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 680px)"));

  assert.match(mobile, /\.main-nav\s*\{[^}]*grid-template-columns:\s*1fr auto/s);
  assert.match(mobile, /\.main-nav ul\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(mobile, /\.hero-content\s*\{[^}]*align-items:\s*flex-end/s);
  assert.match(mobile, /\.hero-video\s*\{[^}]*object-position:\s*50% center/s);
  assert.doesNotMatch(css, /\.hero-visual\s*\{|\.portrait-card\s*\{|\.identity-card\s*\{/);
});

test("tech stack uses evidence groups instead of subjective levels", () => {
  const sectionStart = html.indexOf('<section id="faerdigheder"');
  const sectionEnd = html.indexOf("</section>", sectionStart);
  const section = html.slice(sectionStart, sectionEnd);

  assert.match(section, /Tech Stack &amp; Tools|Tech Stack & Tools/);
  assert.match(section, /Used in live projects/);
  assert.match(section, /Used in prototypes/);
  assert.match(section, /Currently learning/);
  assert.match(section, /StudyMate AI/);
  assert.match(section, /GerlachDesign\.dk — DNS, SSL and domain setup/);
  assert.doesNotMatch(section, /expert/i);
  assert.doesNotMatch(section, /progress/i);
  assert.doesNotMatch(section, /\d+%/);
  assert.doesNotMatch(section, /Comfortable|Experience|Improving|Building with/);
  assert.doesNotMatch(section, /Figma|Photoshop|Premiere Pro|VS Code|Thunder Client|Postman/);
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
    "Role-based AI Assistants",
    "Knowledge Base Systems",
    "Git",
    "GitHub",
    "npm",
    "Cloudflare",
    "Cloudflare Pages Functions",
    "GitHub Pages",
  ];

  for (const item of expected) {
    assert.match(html, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(css, /\.tech-stack-grid\s*\{/);
  assert.match(css, /\.tech-card\s*\{/);
  assert.match(css, /\.tech-evidence-list\s*\{/);
  assert.match(css, /\.tech-evidence-item\s*\{/);
  assert.match(css, /\.tech-project-links\s*\{/);
});
