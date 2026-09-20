import test from "node:test";
import assert from "node:assert/strict";
import {
  addRecentSearch,
  mergeSuggestions,
  pushHistoryEvent,
  parseCompareParams,
  type HistoryEvent,
  savedEntityKey,
  type RecentSearch,
} from "./workspace.ts";

test("savedEntityKey normalizes developer and repository identities", () => {
  assert.equal(savedEntityKey("developer", " Torvalds "), "developer:torvalds");
  assert.equal(savedEntityKey("repository", " Vercel/Next.js "), "repository:vercel/next.js");
});

test("pushHistoryEvent deduplicates by kind and identity and keeps a bounded newest-first list", () => {
  const events: HistoryEvent[] = Array.from({ length: 20 }, (_, index) => ({
    kind: "view",
    entityType: "developer",
    identifier: `user-${index}`,
    timestamp: index,
  }));
  const next = pushHistoryEvent(events, {
    kind: "view",
    entityType: "developer",
    identifier: "USER-5",
    timestamp: 100,
  });
  assert.equal(next.length, 20);
  assert.equal(next[0]?.identifier, "USER-5");
  assert.equal(next.filter((event) => event.identifier.toLowerCase() === "user-5").length, 1);
});

test("mergeSuggestions prefers matching local entries and removes remote duplicates", () => {
  const local = [{ type: "developer" as const, id: "torvalds", label: "Linus Torvalds", detail: "Saved" }];
  const remote = [
    { type: "developer" as const, id: "Torvalds", label: "torvalds", detail: "GitHub" },
    { type: "developer" as const, id: "torvalds2", label: "torvalds2", detail: "GitHub" },
  ];
  assert.deepEqual(mergeSuggestions(local, remote, "torv").map((item) => item.id), ["torvalds", "torvalds2"]);
});

test("addRecentSearch deduplicates, reorders, and bounds history", () => {
  const history: RecentSearch[] = Array.from({ length: 10 }, (_, index) => ({
    query: `query-${index}`,
    type: "developers",
    timestamp: index,
  }));
  const next = addRecentSearch(history, { query: " QUERY-5 ", type: "developers", timestamp: 99 });
  assert.equal(next.length, 10);
  assert.deepEqual(next[0], { query: "QUERY-5", type: "developers", timestamp: 99 });
  assert.equal(next.filter((item) => item.query.toLowerCase() === "query-5").length, 1);
});

test("parseCompareParams accepts valid pairs and rejects malformed repository identifiers", () => {
  assert.deepEqual(parseCompareParams(new URLSearchParams("type=developer&a=torvalds&b=gaearon")), {
    type: "developer",
    a: "torvalds",
    b: "gaearon",
  });
  assert.deepEqual(parseCompareParams(new URLSearchParams("type=repository&a=react&b=vuejs/core")), {
    type: "repository",
    a: "",
    b: "vuejs/core",
  });
});
