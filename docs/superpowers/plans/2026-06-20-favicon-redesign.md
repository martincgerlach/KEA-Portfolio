# Favicon Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current gradient `MG` favicon with the approved, cleaned black-and-white geometric `G` from Canva.

**Architecture:** Canva design `DAHNIy8pRtQ` remains the editable visual master. The website continues to load one static `favicon.png`, while a focused Node test verifies the integration and the exported PNG dimensions.

**Tech Stack:** Canva, PNG, static HTML, Node.js test runner, vanilla project tooling.

---

### Task 1: Clean And Export The Canva Master

**Files:**
- Source design: Canva design `DAHNIy8pRtQ`
- Create temporarily: `/private/tmp/gerlach-favicon-512.png`

- [ ] **Step 1: Open the selected Canva design**

Open [the editable Canva design](https://www.canva.com/d/C92yE5CTZmQ8joR) and confirm the selected page contains the angular black `G` on an off-white square.

- [ ] **Step 2: Remove the stray text element**

Delete the small standalone `G` at the lower-right edge. Keep only the large geometric mark.

- [ ] **Step 3: Normalize the composition**

Center the geometric `G` on the square canvas and preserve approximately 10-12% visual padding on every side. Keep the off-white background and near-black mark; do not add a gradient, shadow, rounded inner tile or extra text.

- [ ] **Step 4: Show the cleaned Canva preview**

Display the updated page preview and verify that the stray text is gone, the mark is centered, and the negative-space corner remains intact.

- [ ] **Step 5: Save the Canva edit**

Commit the Canva editing transaction only after the cleaned preview has been approved.

- [ ] **Step 6: Export the favicon master**

Export the square page as a 512 x 512 px PNG to:

```text
/private/tmp/gerlach-favicon-512.png
```

Expected: RGB or RGBA PNG, exactly 512 x 512 px, with crisp hard edges.

### Task 2: Add A Failing Favicon Regression Test

**Files:**
- Create: `tests/favicon.test.mjs`
- Read: `index.html`
- Read: `favicon.png`

- [ ] **Step 1: Write the failing test**

Create `tests/favicon.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const favicon = await readFile(new URL("../favicon.png", import.meta.url));

test("portfolio uses the approved square PNG favicon", () => {
  assert.match(
    html,
    /<link rel="icon" type="image\/png" href="favicon\.png"\s*\/>/,
  );
  assert.deepEqual([...favicon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(favicon.readUInt32BE(16), 512);
  assert.equal(favicon.readUInt32BE(20), 512);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/favicon.test.mjs
```

Expected: FAIL because the current favicon is 1024 x 1024 px.

- [ ] **Step 3: Commit the regression test**

```bash
git add tests/favicon.test.mjs
git commit -m "Test favicon integration and dimensions"
```

### Task 3: Replace The Website Favicon

**Files:**
- Replace: `favicon.png`
- Verify: `index.html`
- Test: `tests/favicon.test.mjs`

- [ ] **Step 1: Copy the approved Canva export into the site**

Replace `favicon.png` with `/private/tmp/gerlach-favicon-512.png`. Do not change the filename or the existing HTML path.

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
node --test tests/favicon.test.mjs
```

Expected: PASS with a valid 512 x 512 PNG and the existing favicon link.

- [ ] **Step 3: Run the complete automated verification**

Run:

```bash
node --test tests/*.test.mjs
node --check language.js
node --check portfolio-translations.js
node --check blade-rhythm/translations.js
node --check blade-rhythm/script.js
git diff --check
```

Expected: all tests and syntax checks pass with no whitespace errors.

- [ ] **Step 4: Commit the favicon asset**

```bash
git add favicon.png
git commit -m "Replace portfolio favicon with G monogram"
```

### Task 4: Visual QA At Browser Sizes

**Files:**
- Verify: `favicon.png`
- Create temporarily: `/private/tmp/gerlach-favicon-32.png`
- Create temporarily: `/private/tmp/gerlach-favicon-16.png`

- [ ] **Step 1: Create exact-size previews**

Run:

```bash
sips -z 32 32 favicon.png --out /private/tmp/gerlach-favicon-32.png
sips -z 16 16 favicon.png --out /private/tmp/gerlach-favicon-16.png
```

Expected: both commands create valid PNG previews.

- [ ] **Step 2: Inspect the source and previews**

View the 512 px source, 32 px preview and 16 px preview. Confirm:

- only one `G` is visible;
- the outer silhouette is not clipped;
- the inner angular negative space remains recognizable;
- the icon does not look blurred or excessively small.

- [ ] **Step 3: Verify in a real browser**

Serve the worktree locally, open the page in a browser, and verify the favicon in both light and dark browser chrome. Reload once with cache disabled if the previous favicon remains cached.

### Task 5: Review, Merge And Production Verification

**Files:**
- Verify all committed changes on `codex/favicon-redesign`

- [ ] **Step 1: Run the final clean-state verification**

```bash
node --test tests/*.test.mjs
git diff --check
git status -sb
```

Expected: all tests pass and the branch is clean.

- [ ] **Step 2: Push and open a pull request**

Push `codex/favicon-redesign` and create a PR targeting `main` with the Canva direction, test evidence and browser-size QA in the description.

- [ ] **Step 3: Review and merge**

Run CodeRabbit against `origin/main`, address any valid issues, rerun the tests, and squash-merge the clean PR.

- [ ] **Step 4: Verify production**

Confirm `https://gerlachdesign.dk/favicon.png` returns HTTP 200 and has 512 x 512 dimensions. Open `https://gerlachdesign.dk` in a fresh browser context and confirm the new geometric `G` appears in the tab.
