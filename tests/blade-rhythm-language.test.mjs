import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../blade-rhythm/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../blade-rhythm/game.css", import.meta.url), "utf8");
const script = await readFile(new URL("../blade-rhythm/script.js", import.meta.url), "utf8");
const translationsSource = await readFile(new URL("../blade-rhythm/translations.js", import.meta.url), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(translationsSource, context);
const translations = context.window.pageTranslations;

test("Blade Rhythm defaults to English and shares the language engine", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<script src="translations\.js"><\/script>\s*<script src="\.\.\/language\.js"><\/script>\s*<script src="script\.js"><\/script>/s);
});

test("Blade Rhythm exposes the approved flag controls", () => {
  assert.match(html, /data-language="en"[^>]*>[\s\S]*?🇬🇧[\s\S]*?EN/);
  assert.match(html, /data-language="da"[^>]*>[\s\S]*?🇩🇰[\s\S]*?DA/);
  assert.match(css, /\.game-toolbar\s*\{/);
});

test("every game translation hook exists in both languages", () => {
  const keys = [
    ...html.matchAll(/data-i18n="([^"]+)"/g),
    ...html.matchAll(/data-i18n-attr="[^"]*?:([^";]+)[^"]*"/g),
  ].map((match) => match[1]);
  for (const key of new Set(keys)) {
    assert.equal(typeof translations.en[key], "string", `Missing English key: ${key}`);
    assert.equal(typeof translations.da[key], "string", `Missing Danish key: ${key}`);
  }
});

test("dynamic game feedback uses translated keys", () => {
  const keys = ["enemyHit", "tooEarly", "perfect", "hit", "fullHealth", "heal"];
  for (const key of keys) assert.match(script, new RegExp(`GerlachLanguage\\.t\\("game\\.feedback\\.${key}"`));
  assert.match(script, /GerlachLanguage\.t\("game\.notification\.spawn", \{ name: target\.name \}\)/);
  assert.match(script, /GerlachLanguage\.t\("game\.notification\.comboHeal", \{ amount: comboHeal \}\)/);
});

test("language switching cannot restart or duplicate the game loop", () => {
  assert.doesNotMatch(script, /languagechange/);
  assert.doesNotMatch(script, /setLanguage/);
});
