import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pageUrl = new URL('../blade-rhythm/index.html', import.meta.url);
const stylesUrl = new URL('../blade-rhythm/game.css', import.meta.url);

test('Blade Rhythm page has standalone navigation and accessible controls', async () => {
  const html = await readFile(pageUrl, 'utf8');

  assert.match(html, /href=["']\.\.\/index\.html#projekter["']/);
  assert.match(html, /id=["']attackBtn["']/);
  assert.match(html, /id=["']healBtn["']/);
  assert.match(html, /id=["']restartBtn["']/);
  assert.match(html, /aria-live=["']polite["']/);
  assert.doesNotMatch(html, /onclick\s*=/i);
});

test('Blade Rhythm styles support responsive and accessible interaction', async () => {
  const css = await readFile(stylesUrl, 'utf8');

  assert.match(css, /width:\s*min\(100%/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
});
