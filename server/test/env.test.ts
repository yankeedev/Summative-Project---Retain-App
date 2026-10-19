import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ORIGINS,
  createOriginMatcher,
  parseOriginList,
  toOriginPattern,
} from "../src/config/env";

describe("parseOriginList", () => {
  it("splits, trims, and drops empty entries", () => {
    assert.deepEqual(
      parseOriginList(" http://a.test ,, https://b.test , "),
      ["http://a.test", "https://b.test"]
    );
  });

  it("returns an empty list for undefined or blank input", () => {
    assert.deepEqual(parseOriginList(undefined), []);
    assert.deepEqual(parseOriginList("   "), []);
  });
});

describe("toOriginPattern", () => {
  it("escapes regex metacharacters instead of treating them as regex", () => {
    const pattern = toOriginPattern("https://app.example.com");
    assert.equal(pattern.test("https://app.example.com"), true);
    assert.equal(pattern.test("https://appXexampleXcom"), false);
    assert.equal(pattern.test("https://app.example.com.evil.test"), false);
  });

  it("anchors the pattern to the whole origin", () => {
    const pattern = toOriginPattern("https://*.vercel.app");
    assert.equal(pattern.test("https://app.vercel.app"), true);
    assert.equal(pattern.test("https://app.vercel.app/evil"), false);
    assert.equal(pattern.test("https://app.vercel.app.evil.test"), false);
  });
});

describe("createOriginMatcher", () => {
  it("falls back to localhost defaults when nothing is configured", () => {
    for (const raw of [undefined, "", " , "]) {
      const matcher = createOriginMatcher(raw);
      assert.deepEqual(matcher.exact, DEFAULT_ORIGINS);
      assert.deepEqual(matcher.patterns, []);
      assert.equal(matcher.allows("http://localhost:5173"), true);
      assert.equal(matcher.allows("http://localhost:5174"), true);
      assert.equal(matcher.allows("http://localhost:5175"), false);
    }
  });

  it("matches configured origins exactly", () => {
    const matcher = createOriginMatcher("https://retain.test,http://localhost:5173");
    assert.equal(matcher.allows("https://retain.test"), true);
    assert.equal(matcher.allows("http://localhost:5173"), true);
    assert.equal(matcher.allows("https://retain.test.evil.test"), false);
    assert.equal(matcher.allows("http://retain.test"), false);
    assert.equal(matcher.allows("https://Retain.test"), false);
  });

  it("matches Vercel preview deployments through a wildcard entry", () => {
    const matcher = createOriginMatcher(
      "https://retain.test,https://*-yankeedev.vercel.app"
    );
    assert.equal(matcher.allows("https://retain.test"), true);
    assert.equal(
      matcher.allows("https://retain-app-git-main-yankeedev.vercel.app"),
      true
    );
    assert.equal(matcher.allows("https://retain-app-yankeedev.vercel.app"), true);
    // Prefix required by the pattern is still enforced
    assert.equal(matcher.allows("https://retain-app-someoneelse.vercel.app"), false);
    // Wrong scheme / trailing path must not pass
    assert.equal(matcher.allows("http://retain-app-git-main-yankeedev.vercel.app"), false);
    assert.equal(
      matcher.allows("https://retain-app-git-main-yankeedev.vercel.app/path"),
      false
    );
  });

  it("does not wildcard anything the operator did not write a * for", () => {
    const matcher = createOriginMatcher("https://retain.test");
    assert.deepEqual(matcher.patterns, []);
    assert.equal(matcher.allows("https://anything.vercel.app"), false);
  });

  it("accepts pattern-only configuration", () => {
    const matcher = createOriginMatcher("https://*-yankeedev.vercel.app");
    assert.deepEqual(matcher.exact, []);
    assert.equal(matcher.allows("https://preview-yankeedev.vercel.app"), true);
    assert.equal(matcher.allows("http://localhost:5173"), false);
  });

  it("rejects an empty origin", () => {
    const matcher = createOriginMatcher("https://retain.test,https://*-yankeedev.vercel.app");
    assert.equal(matcher.allows(""), false);
  });
});
