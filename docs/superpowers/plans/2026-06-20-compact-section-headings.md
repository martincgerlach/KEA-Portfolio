# Compact Section Headings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace four oversized split section introductions with the approved compact, left-aligned heading pattern.

**Architecture:** Keep the existing semantic section markup and shared `.section-heading` component. Update only the four approved content blocks, simplify the shared CSS from a two-column grid to one constrained content column, and add a focused static regression test before implementation.

**Tech Stack:** HTML5, CSS, Node.js built-in test runner, local static server, browser QA.

---

## File Structure

- Modify `index.html`: replace the labels, titles, and supporting copy for Projects, About, Skills, and CV/material.
- Modify `style.css`: convert `.section-heading` to the approved compact layout and add the mobile title size.
- Create `tests/section-headings.test.mjs`: protect approved copy, layout constraints, and responsive typography.

### Task 1: Add The Section Heading Regression Test

**Files:**
- Create: `tests/section-headings.test.mjs`

- [ ] **Step 1: Write the failing content and layout tests**

Create `tests/section-headings.test.mjs` with:

```js
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
```

- [ ] **Step 2: Run the new test and verify the current design fails**

Run:

```bash
node --test tests/section-headings.test.mjs
```

Expected: FAIL because the current HTML still contains `Projekter med noget på spil` and `.section-heading` still uses a two-column grid.

### Task 2: Apply The Approved Copy And Compact Layout

**Files:**
- Modify: `index.html:55-61`
- Modify: `index.html:292-299`
- Modify: `index.html:327-334`
- Modify: `index.html:381-387`
- Modify: `style.css:413-438`
- Modify: `style.css:770-782`
- Modify: `style.css:803-918`
- Test: `tests/section-headings.test.mjs`

- [ ] **Step 1: Replace the four section introductions**

Replace the Projects heading block with:

```html
<div class="section-heading">
  <p class="section-label">Portfolio</p>
  <h2>Udvalgte projekter</h2>
  <p>Et udvalg af websites, frontend-projekter og designcases, der viser hvordan jeg arbejder med struktur, brugeroplevelse og kode.</p>
</div>
```

Replace the About heading block with:

```html
<div class="section-heading">
  <p class="section-label">Profil</p>
  <h2>Om mig</h2>
  <p>
    Hej, jeg hedder Martin. Jeg er 22 år og uddannet IT-supporter.
    Jeg bruger den tekniske baggrund til at forstå problemerne bag et website, ikke kun hvordan det ser ud på overfladen.
  </p>
</div>
```

Replace the Skills heading block with:

```html
<div class="section-heading">
  <p class="section-label">Det arbejder jeg med</p>
  <h2>Kompetencer</h2>
  <p>De områder og værktøjer jeg bruger i mine projekter og gerne vil udvikle videre.</p>
</div>
```

Replace the CV/material heading block with:

```html
<div class="section-heading">
  <p class="section-label">Ansøgning</p>
  <h2>CV og materiale</h2>
  <p>Dokumenter og cases, der supplerer mit CV og mine ansøgninger.</p>
</div>
```

- [ ] **Step 2: Replace the split heading CSS with the compact shared component**

Replace the existing `.section-heading` rules at `style.css:413-438` with:

```css
.section-heading {
  max-width: 760px;
  margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
}

.section-heading h2 {
  margin-top: 0.65rem;
  color: var(--ink);
  font-size: clamp(3rem, 5vw, 3.75rem);
  line-height: 1.02;
}

.section-heading p:not(.section-label) {
  max-width: 700px;
  margin-top: 1.125rem;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.7;
}
```

In the `@media (max-width: 980px)` rule, remove `.section-heading` from this selector group:

```css
.hero,
.project-card,
.project-card-featured,
.contact-panel {
  grid-template-columns: 1fr;
}
```

Delete the obsolete reset:

```css
.section-heading .section-label,
.section-heading h2,
.section-heading p:not(.section-label) {
  grid-column: auto;
}
```

Add this rule inside `@media (max-width: 680px)` after `.hero-lede`:

```css
.section-heading h2 {
  font-size: clamp(2.125rem, 9vw, 2.375rem);
}
```

- [ ] **Step 3: Run the focused test and verify it passes**

Run:

```bash
node --test tests/section-headings.test.mjs
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 4: Run the complete automated verification**

Run:

```bash
node --test tests/*.test.mjs
node --check blade-rhythm/script.js
git diff --check
```

Expected: 33 tests pass, JavaScript syntax check exits `0`, and `git diff --check` prints no errors.

- [ ] **Step 5: Commit the implementation**

```bash
git add index.html style.css tests/section-headings.test.mjs
git commit -m "Compact portfolio section headings"
```

### Task 3: Verify The Result In The Browser

**Files:**
- Verify: `index.html`
- Verify: `style.css`

- [ ] **Step 1: Start the static site locally**

Run from the worktree root:

```bash
python3 -m http.server 4174
```

Expected: the site is available at `http://127.0.0.1:4174/index.html`.

- [ ] **Step 2: Check desktop dark and light mode at 1440px**

Verify:

- All four labels sit directly above their titles.
- Titles stay between `48px` and `60px` and no longer fill most of the viewport.
- Supporting copy sits directly below each title.
- Project, About, Skills, and CV cards begin noticeably closer to their introductions.
- Theme toggle retains readable contrast.
- Browser console contains no errors or warnings.

- [ ] **Step 3: Check mobile at 390 x 844 and 320px wide**

Verify:

- Section titles stay between `34px` and `38px`.
- No title, label, paragraph, or card is clipped.
- `document.documentElement.scrollWidth === window.innerWidth`.
- Navigation, hero, profile facts, project actions, and contact section remain unchanged.

- [ ] **Step 4: Re-run the final test suite after browser QA**

Run:

```bash
node --test tests/*.test.mjs
node --check blade-rhythm/script.js
git diff --check
git status --short
```

Expected: 33 tests pass, both checks exit `0`, and the worktree is clean after the implementation commit.

- [ ] **Step 5: Push the branch and open a ready pull request**

```bash
git push -u origin codex/compact-section-headings
```

Create a ready PR to `main` titled:

```text
[codex] Compact portfolio section headings
```

The PR description must list the four rewritten headings, the shared CSS simplification, the 33-test result, and desktop/mobile browser QA.
