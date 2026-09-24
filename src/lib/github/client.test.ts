import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGithubOwnerQuery } from "./search-helpers.ts";

test("normalizeGithubOwnerQuery strips explicit owner prefixes", () => {
  assert.equal(normalizeGithubOwnerQuery("@saiganesh-007"), "saiganesh-007");
  assert.equal(normalizeGithubOwnerQuery("user:saiganesh-007"), "saiganesh-007");
  assert.equal(normalizeGithubOwnerQuery("saiganesh-007"), "saiganesh-007");
});

test("normalizeGithubOwnerQuery rejects repository-ish queries", () => {
  assert.equal(normalizeGithubOwnerQuery("facebook/react"), null);
  assert.equal(normalizeGithubOwnerQuery("nextjs"), "nextjs");
  assert.equal(normalizeGithubOwnerQuery("random-invalid-user-xyz123"), "random-invalid-user-xyz123");
});
