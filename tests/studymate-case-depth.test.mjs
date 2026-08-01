import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../cases/studymate-ai.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("StudyMate presents a complete but honest product and software narrative", () => {
  for (const heading of [
    "Project overview",
    "Users and use case",
    "Product concept",
    "User flow and interface decisions",
    "Technical architecture",
    "Frontend and backend implementation",
    "Challenges and current limitations",
    "Testing and iteration",
    "Result and reflection",
  ]) {
    assert.match(html, new RegExp(`>${heading}<`), `${heading} section is missing`);
  }

  assert.match(html, /functional prototype/i);
  assert.match(html, /public GitHub Pages demo demonstrates the complete interface flow with static fallback responses/i);
  assert.match(html, /not production-ready/i);
  assert.match(html, /external testing has not yet been completed/i);
  assert.doesNotMatch(html, /production[- ]ready AI platform|advanced AI system|real user accounts/i);
});

test("the case explains assistant roles, context and interface states with repository-backed detail", () => {
  for (const assistant of [
    "Study Coach",
    "Coding Mentor",
    "Design Critic",
    "UX Researcher",
    "Exam Coach",
    "Project Manager",
  ]) {
    assert.match(html, new RegExp(assistant));
  }

  assert.match(html, /assistant role, internal skill instructions, relevant Markdown context and the user message/i);
  assert.match(html, /weighted keyword and phrase matching/i);
  assert.match(html, /loading, error, retry and static fallback states/i);
  assert.match(html, /assistantId/);
  assert.match(html, /POST <code>\/api\/chat<\/code>/);
});

test("the architecture visual is semantic, accessible and explicit about security boundaries", () => {
  assert.match(html, /<figure class="architecture-visual"[^>]*aria-labelledby="architecture-title"/);
  assert.match(html, /<ol class="architecture-flow"/);

  for (const label of [
    "Student",
    "StudyMate interface",
    "Assistant request",
    "Server-side route",
    "OpenAI Responses API",
    "Interface response",
  ]) {
    assert.match(html, new RegExp(`<h3>${label}<\/h3>`));
  }

  assert.match(html, /04 · Protected/);
  assert.match(html, /API key stays in server-side environment variables/);
  assert.match(html, /reads the environment key/);
  assert.equal((html.match(/class="architecture-node(?: [^"]*)?"/g) ?? []).length, 6);
  assert.match(html, /class="architecture-details"/);
  assert.match(html, /<figcaption>/);
  assert.doesNotMatch(html, /canvas|<svg|mermaid|diagram\.js/i);
});

test("the architecture visual adapts without relying on animation", () => {
  assert.match(css, /\.architecture-flow\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(6,/s);
  assert.match(css, /\.architecture-node::after\s*\{[^}]*content:\s*"";[^}]*rotate\(45deg\)/s);
  assert.match(css, /body\.light-mode \.architecture-visual/);
  assert.match(css, /@media\s*\(max-width:\s*980px\)[\s\S]*\.architecture-flow\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(css, /@media\s*\(max-width:\s*980px\)[\s\S]*\.architecture-node::after\s*\{[^}]*content:\s*"";[^}]*rotate\(135deg\)/s);
  assert.doesNotMatch(css, /@keyframes[^}]*architecture|\.architecture-[^{]+\{[^}]*animation:/s);
});
