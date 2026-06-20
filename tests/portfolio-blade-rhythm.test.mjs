import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function getAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] ?? null;
}

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
  const articles = html.match(/<article class="[^"]*\bproject-card\b[^"]*">[\s\S]*?<\/article>/g) ?? [];
  const article = articles.find((item) => item.includes('<h3>Blade Rhythm</h3>')) ?? '';
  const cta = article.match(/<a\b[^>]*>\s*Play Blade Rhythm\s*<\/a>/i)?.[0] ?? '';
  const preview = article.match(/<img\b[^>]*blade-rhythm-preview\.webp[^>]*>/i)?.[0] ?? '';

  assert.match(article, /<p class="project-type">JavaScript game<\/p>/);
  assert.match(article, /Game logic and frontend/);
  assert.match(article, /dynamic difficulty/);
  assert.equal(getAttribute(cta, 'href'), 'blade-rhythm/index.html');
  assert.equal(getAttribute(cta, 'target'), null);
  assert.equal(getAttribute(preview, 'src'), 'blade-rhythm-preview.webp');
  assert.equal(
    getAttribute(preview, 'alt'),
    'Blade Rhythm gameplay showing the player, enemy and green timing zone',
  );
  assert.equal(getAttribute(preview, 'loading'), 'lazy');
  assert.equal(getAttribute(preview, 'decoding'), 'async');
  assert.equal(getAttribute(preview, 'width'), '1440');
  assert.equal(getAttribute(preview, 'height'), '900');

  for (const term of ['JavaScript', 'Game loop', 'DOM', 'Keyboard input']) {
    assert.match(article, new RegExp(`<li>${term}</li>`));
  }

  await assert.doesNotReject(
    access(new URL('../blade-rhythm-preview.webp', import.meta.url)),
  );
});
