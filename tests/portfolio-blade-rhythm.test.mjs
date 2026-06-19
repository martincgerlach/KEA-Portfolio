import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Blade Rhythm appears between Forni Pizza and Stream Deck', () => {
  const forni = html.indexOf('Forni Pizza Foodtrailer');
  const blade = html.indexOf('Blade Rhythm');
  const streamDeck = html.indexOf('Stream Deck UI redesign');

  assert.ok(forni !== -1, 'Forni Pizza card is missing');
  assert.ok(blade !== -1, 'Blade Rhythm card is missing');
  assert.ok(streamDeck !== -1, 'Stream Deck card is missing');
  assert.ok(forni < blade && blade < streamDeck);
});

test('Blade Rhythm card presents the playable JavaScript project', async () => {
  const articles = html.match(/<article class="project-card">[\s\S]*?<\/article>/g) ?? [];
  const article = articles.find((item) => item.includes('<h3>Blade Rhythm</h3>')) ?? '';

  assert.match(article, /<p class="project-type">JavaScript game<\/p>/);
  assert.match(article, /Game logic og frontend/);
  assert.match(article, /href="blade-rhythm\/index\.html"/);
  assert.match(article, />Spil Blade Rhythm<\/a>/);
  assert.doesNotMatch(article, /href="blade-rhythm\/index\.html"[^>]*target=/);
  assert.match(article, /src="blade-rhythm-preview\.png"/);

  for (const term of ['JavaScript', 'Game loop', 'DOM', 'Keyboard input']) {
    assert.match(article, new RegExp(`<li>${term}</li>`));
  }

  await assert.doesNotReject(
    access(new URL('../blade-rhythm-preview.png', import.meta.url)),
  );
});
