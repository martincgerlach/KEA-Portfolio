import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../cases/studymate-ai.html", import.meta.url), "utf8");
const css = await readFile(new URL("../cases/case-study.css", import.meta.url), "utf8");
const script = await readFile(new URL("../cases/case-study.js", import.meta.url), "utf8");

test("StudyMate has four concise product sections and four technical sections", () => {
  const product = html.slice(html.indexOf('id="product-view"'), html.indexOf('id="technical-view"'));
  const technical = html.slice(html.indexOf('id="technical-view"'), html.indexOf('class="case-next"'));
  assert.equal((product.match(/class="case-content-section"/g) ?? []).length, 4);
  assert.equal((technical.match(/class="case-content-section"/g) ?? []).length, 4);
  for (const heading of ["The problem", "The solution", "User experience", "Testing and reflection", "Current architecture", "Assistant and prompt flow", "Knowledge Base and project context", "Security, limitations and next step"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
});

test("StudyMate keeps its implementation status and limitations explicit", () => {
  assert.match(html, /Functional prototype/i);
  assert.match(html, /public prototype demonstrates the interface and static fallback flow/i);
  assert.match(html, /API key stays server-side/i);
  assert.match(html, /prototype-level/i);
  assert.match(html, /external testing has not yet been completed/i);
  assert.match(html, /Supabase for accounts, stored projects and controlled context/i);
  assert.doesNotMatch(html, /production-ready AI platform|advanced AI system|real user accounts/i);
});

test("assistant, prompt, context and response flow remain repository-backed", () => {
  for (const assistant of ["Study Coach", "Coding Mentor", "Design Critic", "UX Researcher", "Exam Coach", "Project Manager"]) {
    assert.match(html, new RegExp(assistant));
  }
  assert.match(html, /assistantId/);
  assert.match(html, /POST \/api\/chat/);
  assert.match(html, /weighted phrases and keywords/i);
  assert.match(html, /loading, success, error or an honest static fallback/i);
});

test("technical architecture and view switch are semantic and responsive", () => {
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tab"/g) ?? []).length, 2);
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 2);
  assert.equal((html.match(/<li><strong[^>]*>/g) ?? []).length, 6);
  assert.match(css, /\.case-architecture\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.case-architecture\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(script, /ArrowRight/);
  assert.match(script, /history\.replaceState/);
  assert.match(script, /panels\[index\]\.hidden = !isActive/);
});
