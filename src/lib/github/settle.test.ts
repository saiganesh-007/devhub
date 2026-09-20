import assert from "node:assert/strict";
import test from "node:test";
import { optionalRequest } from "./settle.ts";

test("optionalRequest returns successful optional data", async () => {
  assert.deepEqual(await optionalRequest(Promise.resolve(["data"]), []), ["data"]);
});

test("optionalRequest falls back when an optional GitHub request fails", async () => {
  assert.deepEqual(await optionalRequest(Promise.reject(new Error("rate limited")), []), []);
});
