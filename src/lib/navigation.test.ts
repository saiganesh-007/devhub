import assert from "node:assert/strict";
import test from "node:test";
import { safeInternalPath } from "./navigation.ts";

test("safeInternalPath preserves an internal application path", () => {
  assert.equal(safeInternalPath("/search?q=react"), "/search?q=react");
});

test("safeInternalPath rejects absolute and protocol-relative redirects", () => {
  assert.equal(safeInternalPath("https://attacker.example"), "/dashboard");
  assert.equal(safeInternalPath("//attacker.example/path"), "/dashboard");
});

test("safeInternalPath rejects malformed and backslash redirects", () => {
  assert.equal(safeInternalPath("dashboard"), "/dashboard");
  assert.equal(safeInternalPath("/\\attacker.example"), "/dashboard");
});
