# Blade Rhythm Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Blade Rhythm as a playable, responsive JavaScript project and present it in the portfolio after Forni Pizza.

**Architecture:** Copy the existing standalone game into a self-contained `blade-rhythm/` folder so it can be hosted with the static portfolio. Keep gameplay in vanilla JavaScript, route keyboard and button input through shared handlers, and add source-level smoke tests with Node's built-in test runner. The main portfolio only receives one new project card and screenshot asset.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in test runner, local static server, browser QA.

---

## File Map

- Create `blade-rhythm/index.html`: semantic game page, status UI, controls, and back link.
- Create `blade-rhythm/game.css`: responsive game layout and accessible interaction states.
- Create `blade-rhythm/script.js`: existing game logic with shared inputs and one managed loop timer.
- Copy `blade-rhythm/*.png`: the existing arena, characters, and favicon.
- Create `blade-rhythm-preview.png`: real screenshot used by the portfolio card.
- Modify `index.html:143-174`: insert the Blade Rhythm card after Forni Pizza.
- Create `tests/blade-rhythm-files.test.mjs`: verify the standalone game files exist.
- Create `tests/blade-rhythm-page.test.mjs`: verify semantic markup and responsive CSS hooks.
- Create `tests/blade-rhythm-script.test.mjs`: verify shared input and managed timer safeguards.
- Create `tests/portfolio-blade-rhythm.test.mjs`: verify card order, content, CTA, and screenshot.

### Task 1: Copy The Standalone Game

**Files:**
- Create: `tests/blade-rhythm-files.test.mjs`
- Create: `blade-rhythm/index.html`
- Create: `blade-rhythm/game.css`
- Create: `blade-rhythm/script.js`
- Create: `blade-rhythm/arena.png`
- Create: `blade-rhythm/player.png`
- Create: `blade-rhythm/orc.png`
- Create: `blade-rhythm/blood-elf.png`
- Create: `blade-rhythm/human.png`
- Create: `blade-rhythm/favicon.png`

- [ ] **Step 1: Write the failing file-presence test**

```js
// tests/blade-rhythm-files.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";

const files = [
  "index.html",
  "game.css",
  "script.js",
  "arena.png",
  "player.png",
  "orc.png",
  "blood-elf.png",
  "human.png",
  "favicon.png",
];

test("all Blade Rhythm files are present", async () => {
  for (const file of files) {
    await assert.doesNotReject(access(new URL(`../blade-rhythm/${file}`, import.meta.url)));
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/blade-rhythm-files.test.mjs`

Expected: FAIL with `ENOENT` for `blade-rhythm/index.html`.

- [ ] **Step 3: Copy the current game into the portfolio**

```bash
mkdir -p blade-rhythm
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/index.html blade-rhythm/index.html
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/game.css blade-rhythm/game.css
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/script.js blade-rhythm/script.js
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/arena.png blade-rhythm/arena.png
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/player.png blade-rhythm/player.png
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/orc.png blade-rhythm/orc.png
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/blood-elf.png blade-rhythm/blood-elf.png
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/human.png blade-rhythm/human.png
cp /Users/martingerlach/Desktop/Privat/Projekter/sandbox/Blade-Rhythm/favicon.png blade-rhythm/favicon.png
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `node --test tests/blade-rhythm-files.test.mjs`

Expected: 1 test passes.

- [ ] **Step 5: Commit the copied baseline**

```bash
git add blade-rhythm tests/blade-rhythm-files.test.mjs
git commit -m "Add Blade Rhythm game files"
```

### Task 2: Build The Responsive Game Page

**Files:**
- Create: `tests/blade-rhythm-page.test.mjs`
- Modify: `blade-rhythm/index.html`
- Modify: `blade-rhythm/game.css`

- [ ] **Step 1: Write failing markup and CSS tests**

```js
// tests/blade-rhythm-page.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../blade-rhythm/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../blade-rhythm/game.css", import.meta.url), "utf8");

test("game page has navigation, status regions, and semantic controls", () => {
  assert.match(html, /href="\.\.\/index\.html#projekter"/);
  assert.match(html, /id="attackBtn"/);
  assert.match(html, /id="healBtn"/);
  assert.match(html, /id="restartBtn"/);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /onclick=/);
});

test("game layout supports small screens and reduced motion", () => {
  assert.match(css, /width:\s*min\(100%/);
  assert.match(css, /@media \(max-width:\s*700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Run the page tests and verify they fail**

Run: `node --test tests/blade-rhythm-page.test.mjs`

Expected: FAIL because the copied page has inline handlers, no touch controls, and a fixed-width arena.

- [ ] **Step 3: Replace the game body with semantic markup**

Use this exact structure inside `blade-rhythm/index.html`:

```html
<body>
  <a class="back-link" href="../index.html#projekter">Tilbage til portfolio</a>
  <main class="game-shell">
    <header class="game-header">
      <p class="eyebrow">JavaScript game</p>
      <h1><img src="favicon.png" alt="" />Blade Rhythm</h1>
      <p>Ram fjenden på det rigtige tidspunkt. Et perfekt hit giver ekstra skade.</p>
    </header>

    <section class="status-panel" aria-label="Spilstatus">
      <div><span>Health</span><strong id="healthDisplay">100</strong></div>
      <div><span>Enemy</span><strong id="enemyHealth">Loading</strong></div>
      <div><span>Difficulty</span><strong id="levelDisplay">1</strong></div>
    </section>

    <div id="hpContainer" aria-label="Player health">
      <div id="hpBar"></div>
    </div>

    <section id="gameArea" aria-label="Blade Rhythm arena">
      <p id="notification" aria-live="polite"></p>
      <img id="player" src="player.png" alt="Player character" />
      <img id="enemy" src="orc.png" alt="Enemy character" />
      <div id="hitZone" aria-hidden="true"></div>
      <p id="restartHint">Du er besejret. Tryk Restart.</p>
    </section>

    <p id="actionFeedback" class="action-feedback" aria-live="polite"></p>

    <div class="game-controls" aria-label="Spilkontroller">
      <button id="attackBtn" type="button">Attack <kbd>Space</kbd></button>
      <button id="healBtn" type="button">Heal <kbd>H</kbd></button>
      <button id="restartBtn" type="button">Restart <kbd>R</kbd></button>
    </div>
  </main>
  <script src="script.js"></script>
</body>
```

Also add `<meta name="viewport" content="width=device-width, initial-scale=1" />` in `<head>` and change the title to `Blade Rhythm | Martin Gerlach`.

- [ ] **Step 4: Replace fixed dimensions with responsive CSS**

Implement these required rules in `blade-rhythm/game.css`, retaining the existing arena background and character artwork:

```css
:root {
  color-scheme: dark;
  --ink: #f4f7f8;
  --muted: #b7c3ca;
  --surface: rgba(7, 17, 28, 0.88);
  --line: rgba(255, 255, 255, 0.18);
  --accent: #54e0b5;
  --danger: #ff6b6b;
}

* { box-sizing: border-box; }

body {
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
  background: #07111c url("arena.png") center / cover fixed;
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}

.back-link { color: var(--ink); font-weight: 700; }
.game-shell { width: min(100%, 860px); margin: 1rem auto; }
.game-header { text-align: center; }
.game-header h1 { display: flex; justify-content: center; align-items: center; gap: .75rem; }
.game-header img { width: 52px; height: 52px; }
.eyebrow { color: var(--accent); font-size: .78rem; font-weight: 800; text-transform: uppercase; }

.status-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .75rem;
  margin: 1.5rem 0 .75rem;
}
.status-panel div { padding: .75rem; border: 1px solid var(--line); background: var(--surface); }
.status-panel span, .status-panel strong { display: block; }
.status-panel span { color: var(--muted); font-size: .75rem; text-transform: uppercase; }

#hpContainer { width: min(100%, 320px); height: 18px; margin: 0 auto 1rem; background: #3b4650; }
#hpBar { width: 100%; height: 100%; background: var(--accent); transition: width .2s ease; }

#gameArea {
  position: relative;
  width: min(100%, 760px);
  aspect-ratio: 14 / 5;
  min-height: 220px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, .42);
}
#player, #enemy { position: absolute; bottom: 0; width: clamp(82px, 16vw, 120px); height: clamp(82px, 16vw, 120px); object-fit: contain; }
#player { left: 5%; }
#enemy { left: var(--enemy-x, 78%); transition: left .05s linear; }
#hitZone { position: absolute; left: 17%; bottom: 0; width: 12%; height: 100%; border-inline: 2px solid var(--accent); opacity: .7; }
#notification { position: absolute; z-index: 2; top: .75rem; left: .75rem; margin: 0; }
#restartHint { display: none; position: absolute; inset: 45% auto auto 50%; transform: translate(-50%, -50%); color: var(--danger); font-weight: 800; }
.action-feedback { min-height: 1.5rem; text-align: center; font-weight: 800; }

.game-controls { display: flex; justify-content: center; flex-wrap: wrap; gap: .75rem; }
.game-controls button { min-width: 120px; min-height: 48px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit; font-weight: 800; cursor: pointer; }
.game-controls button:hover { border-color: var(--accent); }
.game-controls button:focus-visible, .back-link:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
kbd { margin-left: .35rem; color: var(--muted); }

@media (max-width: 700px) {
  body { padding: .75rem; }
  .status-panel { grid-template-columns: 1fr; }
  #gameArea { min-height: 190px; }
  .game-controls button { flex: 1 1 30%; min-width: 88px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 5: Run the page tests**

Run: `node --test tests/blade-rhythm-page.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 6: Commit the responsive page**

```bash
git add blade-rhythm/index.html blade-rhythm/game.css tests/blade-rhythm-page.test.mjs
git commit -m "Improve Blade Rhythm game page"
```

### Task 3: Share Inputs And Manage One Game Loop

**Files:**
- Create: `tests/blade-rhythm-script.test.mjs`
- Modify: `blade-rhythm/script.js`

- [ ] **Step 1: Write failing script safeguards**

```js
// tests/blade-rhythm-script.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(new URL("../blade-rhythm/script.js", import.meta.url), "utf8");

test("keyboard and buttons use shared handlers", () => {
  assert.match(script, /attackBtn.*addEventListener\("click", handleAttack\)/s);
  assert.match(script, /healBtn.*addEventListener\("click", handleHeal\)/s);
  assert.match(script, /restartBtn.*addEventListener\("click", restartGame\)/s);
});

test("restart clears the previous loop before scheduling another", () => {
  assert.match(script, /let gameTimer = null/);
  assert.match(script, /clearTimeout\(gameTimer\)/);
  assert.match(script, /gameTimer = setTimeout\(gameTick, attackSpeed\)/);
});

test("unused debug input and revive handlers are removed", () => {
  assert.doesNotMatch(script, /getInputValue|handleDamage|revive\(/);
});
```

- [ ] **Step 2: Run the script tests and verify they fail**

Run: `node --test tests/blade-rhythm-script.test.mjs`

Expected: FAIL because the copied script has no button listeners and does not manage its timer.

- [ ] **Step 3: Add shared button input**

Add this after the keyboard listener:

```js
const attackBtn = document.getElementById("attackBtn");
const healBtn = document.getElementById("healBtn");
const restartBtn = document.getElementById("restartBtn");

attackBtn.addEventListener("click", handleAttack);
healBtn.addEventListener("click", handleHeal);
restartBtn.addEventListener("click", restartGame);
```

In the keyboard listener, add `event.preventDefault()` inside the Space branch so the page does not scroll during an attack.

- [ ] **Step 4: Manage one loop timer**

Add `let gameTimer = null;` with the state variables. Replace the end of `gameTick()` with:

```js
updateUI();
gameTimer = setTimeout(gameTick, attackSpeed);
```

Add this at the beginning of `restartGame()` before resetting state:

```js
if (gameTimer !== null) {
  clearTimeout(gameTimer);
  gameTimer = null;
}
```

Keep the existing final `gameTick()` call in `restartGame()`. Delete `handleDamage()`, `getInputValue()`, and `revive()` because the new page does not expose those controls.

- [ ] **Step 5: Match the new status markup**

Update `updateUI()` so text values match the new cards and enemy movement uses a percentage-based custom property:

```js
const enemyPercent = Math.max(0, Math.min(100, (enemyX / 700) * 100));
enemyEl.style.setProperty("--enemy-x", `${enemyPercent}%`);
healthText.textContent = player.health;
hpBar.style.width = `${player.health}%`;
document.getElementById("levelDisplay").textContent = difficulty;
document.getElementById("enemyHealth").textContent = `${target.name}: ${target.health} HP`;
```

Remove `reviveBtn` and the unused `restartBtn` lookup from `updateUI()`. Keep the existing race-to-sprite mapping and death feedback.

- [ ] **Step 6: Run syntax and script tests**

Run: `node --check blade-rhythm/script.js`

Expected: no output and exit code 0.

Run: `node --test tests/blade-rhythm-script.test.mjs`

Expected: 3 tests pass.

- [ ] **Step 7: Commit input and loop safety**

```bash
git add blade-rhythm/script.js tests/blade-rhythm-script.test.mjs
git commit -m "Add responsive controls to Blade Rhythm"
```

### Task 4: Add The Portfolio Project Card

**Files:**
- Create: `tests/portfolio-blade-rhythm.test.mjs`
- Create: `blade-rhythm-preview.png`
- Modify: `index.html:143-174`

- [ ] **Step 1: Write the failing portfolio-card test**

```js
// tests/portfolio-blade-rhythm.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("Blade Rhythm appears between Forni and Stream Deck", () => {
  const forni = html.indexOf("Forni Pizza Foodtrailer");
  const blade = html.indexOf("Blade Rhythm");
  const streamDeck = html.indexOf("Stream Deck UI redesign");
  assert.ok(forni < blade && blade < streamDeck);
});

test("Blade Rhythm card links to the playable game", async () => {
  assert.match(html, /href="blade-rhythm\/index\.html"/);
  assert.match(html, />Spil Blade Rhythm</);
  assert.match(html, /JavaScript game/);
  assert.match(html, /blade-rhythm-preview\.png/);
  await assert.doesNotReject(access(new URL("../blade-rhythm-preview.png", import.meta.url)));
});
```

- [ ] **Step 2: Run the portfolio test and verify it fails**

Run: `node --test tests/portfolio-blade-rhythm.test.mjs`

Expected: FAIL because the card and screenshot do not exist.

- [ ] **Step 3: Capture a real gameplay screenshot**

Start the portfolio server:

```bash
python3 -m http.server 4174
```

In another terminal, capture the page after it loads:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=1500 --screenshot=blade-rhythm-preview.png http://127.0.0.1:4174/blade-rhythm/
```

Expected: `blade-rhythm-preview.png` shows the real arena and game UI at 1440 by 900 pixels.

- [ ] **Step 4: Insert the project card after Forni Pizza**

Add this complete article after the closing `</article>` for Forni Pizza and before Stream Deck:

```html
<article class="project-card">
  <div class="project-content">
    <p class="project-type">JavaScript game</p>
    <h3>Blade Rhythm</h3>
    <p>
      Et timing-baseret browsergame, hvor spilleren angriber, healer og møder hurtigere fjender, efterhånden som sværhedsgraden stiger.
    </p>
    <div class="project-meta">
      <div>
        <span>Udfordring</span>
        <p>At få input, timing og game state til at føles som ét sammenhængende system.</p>
      </div>
      <div>
        <span>Min løsning</span>
        <p>Et vanilla JavaScript game loop med hit zones, combos, health og dynamisk difficulty.</p>
      </div>
    </div>
    <ul class="tag-list" aria-label="Teknologier brugt i Blade Rhythm">
      <li>JavaScript</li>
      <li>Game loop</li>
      <li>DOM</li>
      <li>Keyboard input</li>
    </ul>
    <a class="button button-primary" href="blade-rhythm/index.html">Spil Blade Rhythm</a>
  </div>
  <figure class="project-media">
    <img src="blade-rhythm-preview.png" alt="Gameplay fra JavaScript-spillet Blade Rhythm" />
  </figure>
</article>
```

- [ ] **Step 5: Run the portfolio test**

Run: `node --test tests/portfolio-blade-rhythm.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 6: Commit the portfolio card**

```bash
git add index.html blade-rhythm-preview.png tests/portfolio-blade-rhythm.test.mjs
git commit -m "Showcase Blade Rhythm in portfolio"
```

### Task 5: Browser And Accessibility Verification

**Files:**
- Modify if required: `blade-rhythm/index.html`
- Modify if required: `blade-rhythm/game.css`
- Modify if required: `blade-rhythm/script.js`
- Modify if required: `index.html`

- [ ] **Step 1: Run all automated checks**

Run:

```bash
node --test tests/*.test.mjs
node --check blade-rhythm/script.js
git diff --check
```

Expected: all tests pass, JavaScript syntax is valid, and `git diff --check` prints no errors.

- [ ] **Step 2: Verify desktop gameplay at 1440 pixels**

Open `http://127.0.0.1:4174/blade-rhythm/` and verify:

- Space produces early, normal, and perfect attack feedback depending on enemy position.
- H heals only when below full health and respects the cooldown.
- Enemy defeat increases difficulty and spawns another enemy.
- Death displays restart feedback.
- R resets health, difficulty, combo, speed, and damage without a second loop running.
- Attack, Heal, and Restart buttons call the same behavior as keyboard input.
- The back link returns to `index.html#projekter`.

- [ ] **Step 3: Verify mobile gameplay at 390 by 844 pixels**

Use browser responsive mode and verify:

- No horizontal scroll or clipped controls.
- All three buttons are at least approximately 44 pixels high.
- Player, enemy, and hit zone remain visible.
- Touch/click controls work without relying on keyboard input.
- Status text fits without overlap.

- [ ] **Step 4: Verify portfolio integration in both themes**

Open `http://127.0.0.1:4174/index.html#projekter` and verify:

- Blade Rhythm appears after Forni and before Stream Deck.
- The screenshot is sharp and uses the same media sizing as other projects.
- Card text and tags have sufficient contrast in dark and light mode.
- `Spil Blade Rhythm` opens the local game page.
- Existing project CTAs still work.

- [ ] **Step 5: Commit any QA fixes**

If QA required changes, stage only the files changed during this task:

```bash
git add blade-rhythm/index.html blade-rhythm/game.css blade-rhythm/script.js index.html
git commit -m "Fix Blade Rhythm responsive issues"
```

If no QA changes were required, do not create an empty commit.

### Task 6: Make Portfolio Navigation Smoother

**Files:**
- Create: `tests/portfolio-scroll.test.mjs`
- Modify: `style.css`

- [ ] **Step 1: Write the failing smooth-scroll test**

```js
// tests/portfolio-scroll.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("anchor navigation scrolls smoothly with a stable header offset", () => {
  assert.match(css, /html\s*\{[^}]*scroll-behavior:\s*smooth/s);
  assert.match(css, /html\s*\{[^}]*scroll-padding-top:/s);
  assert.match(css, /\.section\s*\{[^}]*scroll-margin-top:/s);
});

test("reduced motion disables smooth scrolling", () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*scroll-behavior:\s*auto/
  );
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/portfolio-scroll.test.mjs`

Expected: FAIL because the portfolio has not yet defined smooth anchor scrolling and section offsets.

- [ ] **Step 3: Add native smooth scrolling and offsets**

Add these declarations to the existing `html` rule in `style.css`:

```css
scroll-behavior: smooth;
scroll-padding-top: 5.5rem;
```

Add this declaration to the existing `.section` rule:

```css
scroll-margin-top: 5.5rem;
```

Inside the existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
html {
  scroll-behavior: auto;
}
```

Do not add a JavaScript scrolling library or scroll-jacking behavior.

- [ ] **Step 4: Run the smooth-scroll and full test suites**

Run:

```bash
node --test tests/portfolio-scroll.test.mjs
node --test tests/*.test.mjs
git diff --check
```

Expected: the smooth-scroll tests and all existing tests pass, with no whitespace errors.

- [ ] **Step 5: Verify anchor navigation manually**

Open `http://127.0.0.1:4174/index.html` and verify that `Projekter`, `Om mig`, `Skills`, `CV` and `Kontakt` scroll smoothly to headings that remain visible below the sticky navigation. Enable reduced motion in browser devtools and verify that navigation becomes immediate.

- [ ] **Step 6: Commit the scrolling improvement**

```bash
git add style.css tests/portfolio-scroll.test.mjs
git commit -m "Improve portfolio anchor scrolling"
```
