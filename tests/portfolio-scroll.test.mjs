import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function getBlock(source, headerPattern, label) {
  const match = headerPattern.exec(source);
  assert.ok(match, `${label} is missing`);

  const openingBrace = source.indexOf('{', match.index);
  let depth = 1;

  for (let index = openingBrace + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  assert.fail(`${label} is not closed`);
}

function getRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return getBlock(
    source,
    new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{`, 'm'),
    `${selector} rule`,
  );
}

function assertDeclaration(rule, property, value) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(
    rule,
    new RegExp(`(?:^|;)\\s*${escapedProperty}\\s*:\\s*${escapedValue}\\s*(?:;|$)`, 'm'),
  );
}

test('html enables smooth anchor scrolling with a fixed-header offset', () => {
  const htmlRule = getRule(css, 'html');

  assertDeclaration(htmlRule, 'scroll-behavior', 'smooth');
  assertDeclaration(htmlRule, 'scroll-padding-top', '5.5rem');
});

test('portfolio sections preserve the fixed-header offset when targeted', () => {
  const sectionRule = getRule(css, '.section');

  assertDeclaration(sectionRule, 'scroll-margin-top', '5.5rem');
});

test('reduced motion disables smooth scrolling on html', () => {
  const reducedMotionBlock = getBlock(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/,
    'prefers-reduced-motion media query',
  );
  const htmlRule = getRule(reducedMotionBlock, 'html');

  assertDeclaration(htmlRule, 'scroll-behavior', 'auto');
});

test('anchor scrolling remains a style-only enhancement', () => {
  const inlineScripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join('\n');

  assert.doesNotMatch(page, /(?:lenis|locomotive-scroll|smooth-scrollbar|smooth-scroll)\b/i);
  assert.doesNotMatch(inlineScripts, /\b(?:scrollTo|scrollBy|scrollIntoView)\s*\(/);
  assert.doesNotMatch(
    inlineScripts,
    /addEventListener\s*\(\s*["'](?:scroll|wheel|touchmove)["']/,
  );
});
