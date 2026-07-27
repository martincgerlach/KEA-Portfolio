import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const cases = ["studymate-ai", "blade-rhythm", "aquashield"];

test("relevant cases contain explicit planned usability tests", async () => {
  for (const name of cases) {
    const source = await readFile(new URL(`../cases/${name}.html`, import.meta.url), "utf8");
    assert.match(source, /class="case-section usability-plan"/);
    assert.match(source, /Usability testing plan/);
    assert.match(source, /Status: Planned — external testing has not yet been completed\./);
    assert.match(source, /Objective and participants/);
    assert.match(source, /3–5/);
    assert.match(source, /<ol class="test-task-list">/);
    assert.match(source, /Observe and measure/);
    assert.match(source, /task completion, critical errors, moderator assistance, hesitation or wrong turns, and participant comments/i);
    assert.match(source, /Findings:<\/strong> Pending external sessions/);
    assert.match(source, /Resulting design changes:<\/strong> Pending analysis/);
  }
});

test("StudyMate labels its existing review as internal", async () => {
  const source = await readFile(new URL("../cases/studymate-ai.html", import.meta.url), "utf8");
  assert.match(source, /Internal walkthrough before external testing/);
  assert.match(source, /<h3>Internal walkthrough<\/h3>/);
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
