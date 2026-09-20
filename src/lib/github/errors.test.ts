import test from "node:test";
import assert from "node:assert/strict";
import { githubErrorCode, shouldRetryGitHub } from "./errors.ts";

test("githubErrorCode distinguishes auth, missing, rate limit, and availability failures", () => {
  assert.equal(githubErrorCode(401, 10), "GITHUB_UNAUTHORIZED");
  assert.equal(githubErrorCode(404, 10), "NOT_FOUND");
  assert.equal(githubErrorCode(403, 0), "RATE_LIMITED");
  assert.equal(githubErrorCode(429, 10), "RATE_LIMITED");
  assert.equal(githubErrorCode(503, 10), "GITHUB_UNAVAILABLE");
});

test("shouldRetryGitHub retries only transient server failures", () => {
  assert.equal(shouldRetryGitHub(500, 0), true);
  assert.equal(shouldRetryGitHub(404, 0), false);
  assert.equal(shouldRetryGitHub(403, 0), false);
});
