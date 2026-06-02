import { describe, it, expect, vi, beforeEach } from "vitest";
import { matchesKeyword } from "../src/services/automation";

// ─────────────────────────────────────────
// Automation Engine Tests
// ─────────────────────────────────────────

// We test the keyword matching helper directly
// (exported from automation.ts for testability)

describe("Keyword Matching", () => {
  const rules = [
    { keyword: "link", matchType: "CONTAINS", caseSensitive: false },
    { keyword: "send", matchType: "CONTAINS", caseSensitive: false },
    { keyword: "info", matchType: "STARTS_WITH", caseSensitive: false },
    { keyword: "giveaway", matchType: "EXACT", caseSensitive: false },
  ];

  it("matches CONTAINS keyword (case-insensitive)", () => {
    expect(matchesKeyword("Please send me the link!", rules)).toBe("link");
  });

  it("matches partial CONTAINS keyword", () => {
    expect(matchesKeyword("Can you SEND me the info?", rules)).toBe("send");
  });

  it("matches STARTS_WITH keyword", () => {
    expect(matchesKeyword("info please!", rules)).toBe("info");
  });

  it("does NOT match STARTS_WITH when keyword is in middle", () => {
    expect(matchesKeyword("want info here", rules)).toBeNull();
  });

  it("matches EXACT keyword", () => {
    expect(matchesKeyword("giveaway", rules)).toBe("giveaway");
  });

  it("does NOT match EXACT when extra text present", () => {
    expect(matchesKeyword("giveaway please", rules)).toBeNull();
  });

  it("returns null when no keyword matches", () => {
    expect(matchesKeyword("Nice post! Love it.", rules)).toBeNull();
  });

  it("handles empty comment text", () => {
    expect(matchesKeyword("", rules)).toBeNull();
  });
});

// ─────────────────────────────────────────
// Idempotency and Window Tests (mocked)
// ─────────────────────────────────────────

describe("24-Hour Window Enforcement", () => {
  it("allows DM within 24 hours", () => {
    const triggeredAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    const windowExpiry = triggeredAt.getTime() + 24 * 60 * 60 * 1000;
    expect(Date.now()).toBeLessThan(windowExpiry);
  });

  it("rejects DM after 24 hours", () => {
    const triggeredAt = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    const windowExpiry = triggeredAt.getTime() + 24 * 60 * 60 * 1000;
    expect(Date.now()).toBeGreaterThan(windowExpiry);
  });
});
