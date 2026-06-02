import { describe, it, expect } from "vitest";
import { verifyWebhookSignature } from "../../packages/utils/src/meta-signature";
import { encryptToken, decryptToken } from "../../packages/db/src/crypto";
import { createHmac } from "crypto";

// Set up test encryption key
process.env.ENCRYPTION_KEY = "dGVzdF9lbmNyeXB0aW9uX2tleV8zMl9ieXRlc2xvbmc=";

// ─────────────────────────────────────────
// Webhook Signature Tests
// ─────────────────────────────────────────

describe("Webhook Signature Verification", () => {
  const secret = "test_webhook_secret";
  const body = Buffer.from(JSON.stringify({ object: "instagram", entry: [] }));

  function makeSignature(b: Buffer, s: string): string {
    return "sha256=" + createHmac("sha256", s).update(b).digest("hex");
  }

  it("accepts a valid signature", () => {
    const sig = makeSignature(body, secret);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("rejects a wrong secret", () => {
    const sig = makeSignature(body, "wrong_secret");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(false);
  });

  it("rejects a tampered body", () => {
    const sig = makeSignature(body, secret);
    const tamperedBody = Buffer.from("tampered");
    expect(verifyWebhookSignature(tamperedBody, sig, secret)).toBe(false);
  });

  it("rejects empty signature", () => {
    expect(verifyWebhookSignature(body, "", secret)).toBe(false);
  });

  it("handles sha256= prefix", () => {
    const sig = makeSignature(body, secret);
    expect(sig.startsWith("sha256=")).toBe(true);
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });
});

// ─────────────────────────────────────────
// Token Encryption Tests
// ─────────────────────────────────────────

describe("Token Encryption", () => {
  const testToken = "EAABs...long_instagram_access_token_here";

  it("encrypts and decrypts a token correctly", () => {
    const encrypted = encryptToken(testToken);
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(testToken);
  });

  it("encrypted output has iv:authTag:ciphertext format", () => {
    const encrypted = encryptToken(testToken);
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0].length).toBeGreaterThan(0); // iv
    expect(parts[1].length).toBeGreaterThan(0); // authTag
    expect(parts[2].length).toBeGreaterThan(0); // ciphertext
  });

  it("produces different ciphertext each time (random IV)", () => {
    const enc1 = encryptToken(testToken);
    const enc2 = encryptToken(testToken);
    expect(enc1).not.toBe(enc2);
    // But both should decrypt to the same value
    expect(decryptToken(enc1)).toBe(testToken);
    expect(decryptToken(enc2)).toBe(testToken);
  });

  it("throws on invalid encrypted format", () => {
    expect(() => decryptToken("invalid_no_colons")).toThrow();
  });

  it("throws on tampered ciphertext (auth tag mismatch)", () => {
    const encrypted = encryptToken(testToken);
    const parts = encrypted.split(":");
    parts[2] = Buffer.from("tampered_data").toString("base64");
    expect(() => decryptToken(parts.join(":"))).toThrow();
  });
});
