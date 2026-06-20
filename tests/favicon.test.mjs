import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const favicon = await readFile(new URL("../favicon.png", import.meta.url));

test("portfolio links to the PNG favicon", () => {
  assert.match(
    html,
    /<link rel="icon" type="image\/png" href="favicon\.png" \/>/,
  );
});

test("favicon is a 512 by 512 PNG", () => {
  assert.deepEqual(
    [...favicon.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
  assert.equal(favicon.readUInt32BE(16), 512);
  assert.equal(favicon.readUInt32BE(20), 512);
});
