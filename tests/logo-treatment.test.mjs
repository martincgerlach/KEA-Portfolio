import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
const logo = await readFile(
  new URL("../Gerlach Design.svg", import.meta.url),
  "utf8",
);

test("the compact wordmark remains in navigation and hero identity", () => {
  assert.equal(html.match(/src="Gerlach Design\.svg"/g)?.length, 2);
  assert.match(logo, /viewBox="-12 210 1224 356"/);
  assert.match(
    logo,
    /<rect x="-12" y="210" width="1224" height="356" rx="3" fill="#ffffff" \/>/,
  );
});

test("wordmark containers do not add large white tiles", () => {
  assert.match(css, /\.nav-brand\s*\{[^}]*background:\s*transparent;/s);
  assert.match(
    css,
    /\.identity-card img\s*\{[^}]*padding:\s*0;[^}]*background:\s*transparent;/s,
  );
});
