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

  const context = {
    console: { log() {} },
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
  assert.match(
    script,
    /const\s+enemyPosition\s*=\s*Math\.min\(100,\s*Math\.max\(0,\s*\(enemyX\s*\/\s*700\)\s*\*\s*100\)\)\s*;/,
  );
  assert.match(
    script,
    /enemyEl\.style\.setProperty\(["']--enemy-x["'],\s*enemyPosition\s*\+\s*["']%["']\)\s*;/,
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
  assert.match(script, /if\s*\(enemyX\s*>\s*hitZone\)/);
  assert.match(script, /if\s*\(enemyX\s*<=\s*perfectZone\)/);
  assert.match(script, /damage\s*\*=\s*1\.5/);
  assert.match(script, /combo\+\+/);
  assert.match(script, /if\s*\(combo\s*>=\s*comboGoal\)/);
  assert.match(script, /increaseDifficulty\(\);\s*spawnEnemy\(\);/s);
  assert.match(script, /if\s*\(player\.health\s*<=\s*0\)/);
  assert.match(script, /isAlive\s*=\s*false\s*;/);
});
