import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pageUrl = new URL('../blade-rhythm/index.html', import.meta.url);
const stylesUrl = new URL('../blade-rhythm/game.css', import.meta.url);

test('Blade Rhythm page has standalone navigation and accessible controls', async () => {
  const html = await readFile(pageUrl, 'utf8');

  assert.match(html, /<meta\s+name=["']viewport["']\s+content=["'][^"']+["']\s*\/?>/i);
  assert.match(html, /href=["']\.\.\/index\.html#projekter["']/);
  assert.match(html, /<button\b[^>]*\bid=["']attackBtn["'][^>]*>/i);
  assert.match(html, /<button\b[^>]*\bid=["']healBtn["'][^>]*>/i);
  assert.match(html, /<button\b[^>]*\bid=["']restartBtn["'][^>]*>/i);
  assert.match(html, /<p\s+class=["']eyebrow["']\s+lang=["']en["']>JavaScript game<\/p>/i);
  assert.match(html, /<span\s+lang=["']en["']>Attack<\/span>/i);
  assert.match(html, /<span\s+lang=["']en["']>Heal<\/span>/i);
  assert.match(html, /<span\s+lang=["']en["']>Restart<\/span>/i);
  assert.match(html, /<kbd\s+lang=["']en["']>Space<\/kbd>/i);
  assert.match(html, /helbred dig mellem angrebene/i);
  assert.match(html, /aria-live=["']polite["']/);
  assert.doesNotMatch(html, /onclick\s*=/i);
});

test('Blade Rhythm status items separate Danish labels from dynamic values', async () => {
  const html = await readFile(pageUrl, 'utf8');

  assert.match(html, /<p[^>]*>\s*<span>Liv<\/span>\s*<strong\s+id=["']healthDisplay["'][^>]*>/i);
  assert.match(html, /<p[^>]*>\s*<span>Fjende<\/span>\s*<strong\s+id=["']enemyHealth["'][^>]*>/i);
  assert.match(html, /<p[^>]*>\s*<span>Sværhedsgrad<\/span>\s*<strong\s+id=["']levelDisplay["'][^>]*>/i);
});

test('Blade Rhythm styles support responsive and accessible interaction', async () => {
  const css = await readFile(stylesUrl, 'utf8');

  const gameShellRule = css.match(/\.game-shell\s*\{([^}]*)\}/)?.[1] ?? '';
  const gameAreaRule = css.match(/#gameArea\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(gameShellRule, /width:\s*min\(100%,\s*860px\)\s*;/);
  assert.match(gameAreaRule, /width:\s*min\(100%,\s*760px\)\s*;/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(
    css,
    /\.back-link:focus-visible\s*,\s*\.game-controls\s+button:focus-visible\s*\{/,
  );

  const hitZoneRule = css.match(/#hitZone\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(hitZoneRule, /left:\s*17%\s*;/);
  assert.match(hitZoneRule, /width:\s*12%\s*;/);
});
