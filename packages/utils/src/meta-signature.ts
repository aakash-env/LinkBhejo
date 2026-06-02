import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify Meta webhook X-Hub-Signature-256 header
 * @param rawBody  Raw request body as Buffer
 * @param signature  Value of X-Hub-Signature-256 header (e.g. "sha256=abc123")
 * @param secret  META_WEBHOOK_SECRET env var
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expected = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  const hmac = createHmac("sha256", secret);
  hmac.update(rawBody);
  const computed = hmac.digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
