import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const cases = ["studymate-ai", "blade-rhythm", "playnext"];

test("relevant cases preserve concise but explicit planned usability tests", async () => {
  for (const name of cases) {
    const source = await readFile(new URL(`../cases/${name}.html`, import.meta.url), "utf8");
    assert.match(source, /class="case-test-plan"/);
    assert.match(source, /Planned test details/);
    assert.match(source, /Status:[^<]*(?:Planned|planned)/);
    assert.match(source, /Objective and participants/);
    assert.match(source, /3–5/);
    assert.match(source, /class="case-task-list"/);
    assert.match(source, /Observe and measure/);
    assert.match(source, /critical errors/);
    assert.match(source, /Pending evidence/);
  }
});

test("StudyMate distinguishes internal review from external testing", async () => {
  const source = await readFile(new URL("../cases/studymate-ai.html", import.meta.url), "utf8");
  assert.match(source, /An internal walkthrough improved fallback copy/);
  assert.match(source, /external testing has not yet been completed/i);
  assert.doesNotMatch(source, /First-pass usability test|Main findings|Changes after testing/);
});

test("the reusable test template captures evidence without personal data", async () => {
  const file = new URL("../docs/usability-test-template.md", import.meta.url);
  await assert.doesNotReject(access(file));
  const source = await readFile(file, "utf8");
  for (const heading of ["Participant ID", "Participant profile", "Tasks", "Observation notes", "Completion status", "Participant comments", "Issues Found", "Severity", "Proposed change", "Change implemented"]) {
    assert.match(source, new RegExp(heading));
  }
  assert.match(source, /Do not include names, email addresses or other identifying information/);
});
