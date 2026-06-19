import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script = readFileSync(
  new URL('../blade-rhythm/script.js', import.meta.url),
  'utf8',
);

test('control buttons use the shared game handlers', () => {
  assert.match(
    script,
    /document\.getElementById\(["']attackBtn["']\)\.addEventListener\(["']click["'],\s*handleAttack\)/,
  );
  assert.match(
    script,
    /document\.getElementById\(["']healBtn["']\)\.addEventListener\(["']click["'],\s*handleHeal\)/,
  );
  assert.match(
    script,
    /document\.getElementById\(["']restartBtn["']\)\.addEventListener\(["']click["'],\s*restartGame\)/,
  );
});

test('keyboard controls prevent space scrolling and retain H and R', () => {
  assert.match(
    script,
    /if\s*\(event\.code\s*===\s*["']Space["']\)\s*\{\s*event\.preventDefault\(\);\s*handleAttack\(\);\s*\}/s,
  );
  assert.match(
    script,
    /if\s*\(event\.key\.toLowerCase\(\)\s*===\s*["']h["']\)\s*\{\s*handleHeal\(\);\s*\}/s,
  );
  assert.match(
    script,
    /if\s*\(event\.key\.toLowerCase\(\)\s*===\s*["']r["']\)\s*\{\s*restartGame\(\);\s*\}/s,
  );
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
