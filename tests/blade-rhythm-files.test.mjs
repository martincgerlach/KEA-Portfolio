import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const files = [
  'index.html',
  'game.css',
  'script.js',
  'arena.png',
  'player.png',
  'orc.png',
  'blood-elf.png',
  'human.png',
  'favicon.png',
];

test('Blade Rhythm source files are available', async () => {
  for (const file of files) {
    await assert.doesNotReject(access(new URL(`../blade-rhythm/${file}`, import.meta.url)));
  }
});
