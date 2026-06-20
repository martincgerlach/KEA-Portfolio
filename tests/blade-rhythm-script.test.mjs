import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(
  new URL('../blade-rhythm/script.js', import.meta.url),
  'utf8',
);
const page = readFileSync(
  new URL('../blade-rhythm/index.html', import.meta.url),
  'utf8',
);
const elementIds = [...page.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

function createElement() {
  const listeners = new Map();
  const classes = new Set();
  const style = {
    width: '',
    setProperty(name, value) {
      this[name] = value;
    },
  };

  return {
    clientWidth: 0,
    offsetWidth: 0,
    textContent: '',
    src: '',
    style,
    listeners,
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
  };
}

function createGameHarness() {
  const elements = Object.fromEntries(
    elementIds.map((id) => [id, createElement()]),
  );
  const documentListeners = new Map();
  const timers = new Map();
  let nextTimerId = 1;

  elements.gameArea.clientWidth = 354;
  elements.enemy.offsetWidth = 96;

  const context = {
    console: { log() {} },
    GerlachLanguage: {
      t(key, values = {}) {
        const messages = {
          "game.feedback.tooEarly": "❌ TOO EARLY",
          "game.feedback.fullHealth": "✨ ALREADY FULL",
          "game.feedback.perfect": "🔥 PERFECT",
        };
        return (messages[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
      },
    },
    document: {
      getElementById(id) {
        return elements[id];
      },
      addEventListener(type, handler) {
        documentListeners.set(type, handler);
      },
    },
    setTimeout(callback, delay) {
      const id = nextTimerId++;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };

  vm.runInNewContext(script, context, { filename: 'blade-rhythm/script.js' });

  return { documentListeners, elements, timers };
}

function timersWithDelay(harness, delay) {
  return [...harness.timers.entries()].filter(([, timer]) => timer.delay === delay);
}

function click(harness, elementId) {
  harness.elements[elementId].listeners.get('click')();
}

function dispatchKey(harness, event) {
  harness.documentListeners.get('keydown')(event);
}

function runNextGameTick(harness) {
  const [timerId, timer] = timersWithDelay(harness, 50)[0];
  harness.timers.delete(timerId);
  timer.callback();
}

function runGameTicks(harness, count) {
  for (let tick = 0; tick < count; tick++) {
    runNextGameTick(harness);
  }
}

function runTimerWithDelay(harness, delay) {
  const [timerId, timer] = timersWithDelay(harness, delay)[0];
  harness.timers.delete(timerId);
  timer.callback();
}

test('initial load schedules exactly one game-loop timer', () => {
  const harness = createGameHarness();

  assert.equal(timersWithDelay(harness, 50).length, 1);
  assert.equal(timersWithDelay(harness, 1200).length, 1);
});

test('repeated restart clicks replace the active game-loop timer', () => {
  const harness = createGameHarness();
  let previousTimerId = timersWithDelay(harness, 50)[0][0];

  for (let restart = 0; restart < 4; restart++) {
    click(harness, 'restartBtn');

    const gameTimers = timersWithDelay(harness, 50);
    assert.equal(gameTimers.length, 1);
    assert.equal(harness.timers.has(previousTimerId), false);
    previousTimerId = gameTimers[0][0];
  }
});

test('space prevents scrolling and attacks like the attack button', () => {
  const keyboardHarness = createGameHarness();
  const buttonHarness = createGameHarness();
  let prevented = false;

  dispatchKey(keyboardHarness, {
    code: 'Space',
    key: ' ',
    preventDefault() {
      prevented = true;
    },
  });
  click(buttonHarness, 'attackBtn');

  assert.equal(prevented, true);
  assert.equal(
    keyboardHarness.elements.actionFeedback.textContent,
    '❌ TOO EARLY',
  );
  assert.equal(
    keyboardHarness.elements.actionFeedback.textContent,
    buttonHarness.elements.actionFeedback.textContent,
  );
});

test('H heals like the heal button at full health', () => {
  const keyboardHarness = createGameHarness();
  const buttonHarness = createGameHarness();

  dispatchKey(keyboardHarness, {
    code: 'KeyH',
    key: 'h',
    preventDefault() {},
  });
  click(buttonHarness, 'healBtn');

  assert.equal(
    keyboardHarness.elements.actionFeedback.textContent,
    '✨ ALREADY FULL',
  );
  assert.equal(
    keyboardHarness.elements.actionFeedback.textContent,
    buttonHarness.elements.actionFeedback.textContent,
  );
});

test('R replaces the active game-loop timer', () => {
  const harness = createGameHarness();
  const previousTimerId = timersWithDelay(harness, 50)[0][0];

  dispatchKey(harness, {
    code: 'KeyR',
    key: 'r',
    preventDefault() {},
  });

  assert.equal(harness.timers.has(previousTimerId), false);
  assert.equal(timersWithDelay(harness, 50).length, 1);
});

test('all control buttons register click listeners', () => {
  const harness = createGameHarness();

  for (const id of ['attackBtn', 'healBtn', 'restartBtn']) {
    assert.equal(typeof harness.elements[id].listeners.get('click'), 'function');
  }
});

test('game loop stores its timer handle', () => {
  assert.match(script, /let\s+gameTimer\s*=\s*null\s*;/);
  assert.match(
    script,
    /gameTimer\s*=\s*setTimeout\(gameTick,\s*attackSpeed\)\s*;/,
  );
});

test('restart clears the old timer and starts one fresh loop after reset', () => {
  const restartGame = script.match(
    /function\s+restartGame\(\)\s*\{([\s\S]*?)\n\}/,
  )?.[1] ?? '';

  assert.match(
    restartGame,
    /if\s*\(gameTimer\s*!==\s*null\)\s*\{\s*clearTimeout\(gameTimer\);\s*gameTimer\s*=\s*null;\s*\}/s,
  );
  assert.match(restartGame, /player\.health\s*=\s*100\s*;/);
  assert.match(restartGame, /isAlive\s*=\s*true\s*;/);
  assert.match(restartGame, /canAttack\s*=\s*true\s*;/);
  assert.match(restartGame, /canHeal\s*=\s*true\s*;/);
  assert.match(restartGame, /enemyBlocked\s*=\s*false\s*;/);
  assert.match(restartGame, /difficulty\s*=\s*1\s*;/);
  assert.match(restartGame, /combo\s*=\s*0\s*;/);
  assert.match(restartGame, /playerDamage\s*=\s*20\s*;/);
  assert.match(restartGame, /comboHeal\s*=\s*20\s*;/);
  assert.match(restartGame, /enemyDamage\s*=\s*5\s*;/);
  assert.match(restartGame, /enemySpeed\s*=\s*5\s*;/);
  assert.match(restartGame, /spawnEnemy\(\);[\s\S]*updateUI\(\);[\s\S]*gameTick\(\);/);
  assert.equal((restartGame.match(/gameTick\(\);/g) ?? []).length, 1);
});

test('UI uses responsive enemy position and numeric status values', () => {
  assert.match(script, /const\s+ENEMY_START_X\s*=\s*600\s*;/);
  assert.match(script, /const\s+HIT_ZONE_X\s*=\s*140\s*;/);
  assert.match(script, /const\s+PERFECT_ZONE_X\s*=\s*70\s*;/);
  assert.match(script, /const\s+ENEMY_ATTACK_X\s*=\s*80\s*;/);
  assert.match(script, /const\s+ENEMY_RESET_X\s*=\s*50\s*;/);
  assert.match(
    script,
    /const\s+maxEnemyLeft\s*=\s*Math\.max\(\s*0,\s*gameArea\.clientWidth\s*-\s*enemyEl\.offsetWidth,?\s*\)\s*;/,
  );
  assert.match(
    script,
    /const\s+progress\s*=\s*Math\.max\(0,\s*Math\.min\(1,\s*enemyX\s*\/\s*ENEMY_START_X\)\)\s*;/,
  );
  assert.match(
    script,
    /enemyEl\.style\.setProperty\(["']--enemy-x["'],\s*progress\s*\*\s*maxEnemyLeft\s*\+\s*["']px["']\)\s*;/,
  );
  assert.match(script, /healthText\.textContent\s*=\s*player\.health\s*;/);
  assert.match(script, /hpBar\.style\.width\s*=\s*player\.health\s*\+\s*["']%["']\s*;/);
  assert.match(
    script,
    /document\.getElementById\(["']levelDisplay["']\)\.textContent\s*=\s*difficulty\s*;/,
  );
  assert.match(
    script,
    /document\.getElementById\(["']enemyHealth["']\)\.textContent\s*=\s*target\.name\s*\+\s*["']:\s*["']\s*\+\s*target\.health\s*\+\s*["']\s*HP["']\s*;/,
  );
  assert.match(script, /target\.race\s*===\s*["']Orc["']/);
  assert.match(script, /target\.race\s*===\s*["']Blood Elf["']/);
  assert.match(script, /target\.race\s*===\s*["']Human["']/);
});

test('initial enemy position stays within the arena', () => {
  const harness = createGameHarness();
  const enemyStyle = harness.elements.enemy.style['--enemy-x'];
  const enemyPosition = Number.parseFloat(enemyStyle);

  assert.match(enemyStyle, /px$/);
  assert.ok(
    enemyPosition + harness.elements.enemy.offsetWidth <=
      harness.elements.gameArea.clientWidth,
  );
});

test('a defeated enemy does not block the next enemy attack', () => {
  const harness = createGameHarness();

  runGameTicks(harness, 105);
  for (let hit = 0; hit < 4; hit++) {
    if (hit > 0) runGameTicks(harness, 111);
    click(harness, 'attackBtn');
    runTimerWithDelay(harness, 300);
  }

  runGameTicks(harness, 105);

  assert.equal(harness.elements.healthDisplay.textContent, 95);
});

test('one enemy cycle damages the player at most once before reset', () => {
  const harness = createGameHarness();

  runGameTicks(harness, 111);

  assert.equal(harness.elements.healthDisplay.textContent, 95);
});

test('legacy controls and helpers are removed', () => {
  assert.doesNotMatch(script, /getElementById\(["']reviveBtn["']\)/);
  assert.doesNotMatch(script, /function\s+handleDamage\s*\(/);
  assert.doesNotMatch(script, /function\s+getInputValue\s*\(/);
  assert.doesNotMatch(script, /function\s+revive\s*\(/);

  const updateUI = script.match(
    /function\s+updateUI\(\)\s*\{([\s\S]*?)\n\}/,
  )?.[1] ?? '';
  assert.doesNotMatch(updateUI, /getElementById\(["']restartBtn["']\)/);
});

test('core combat and progression behavior remains present', () => {
  assert.match(script, /let\s+enemyX\s*=\s*ENEMY_START_X\s*;/);
  assert.match(script, /if\s*\(enemyX\s*<\s*ENEMY_ATTACK_X/);
  assert.match(script, /if\s*\(enemyX\s*<\s*ENEMY_RESET_X\)/);
  assert.match(script, /if\s*\(enemyX\s*>\s*HIT_ZONE_X\)/);
  assert.match(script, /if\s*\(enemyX\s*<=\s*PERFECT_ZONE_X\)/);
  assert.match(
    script,
    /enemyBlocked\s*=\s*false;\s*enemyX\s*=\s*ENEMY_START_X;/s,
  );
  assert.match(script, /damage\s*\*=\s*1\.5/);
  assert.match(script, /combo\+\+/);
  assert.match(script, /if\s*\(combo\s*>=\s*comboGoal\)/);
  assert.match(script, /increaseDifficulty\(\);\s*spawnEnemy\(\);/s);
  assert.match(script, /if\s*\(player\.health\s*<=\s*0\)/);
  assert.match(script, /isAlive\s*=\s*false\s*;/);
});

test('perfect timing zone is reachable before the enemy resets', () => {
  const harness = createGameHarness();

  runGameTicks(harness, 105);

  click(harness, 'attackBtn');

  assert.equal(harness.elements.actionFeedback.textContent, '🔥 PERFECT');
});
