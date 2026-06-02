"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
const crypto_1 = require("crypto");
/**
 * Verify Meta webhook X-Hub-Signature-256 header
 * @param rawBody  Raw request body as Buffer
 * @param signature  Value of X-Hub-Signature-256 header (e.g. "sha256=abc123")
 * @param secret  META_WEBHOOK_SECRET env var
 */
function verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature || !secret)
        return false;
    const expected = signature.startsWith("sha256=")
        ? signature.slice(7)
        : signature;
    const hmac = (0, crypto_1.createHmac)("sha256", secret);
    hmac.update(rawBody);
    const computed = hmac.digest("hex");
    try {
        return (0, crypto_1.timingSafeEqual)(Buffer.from(computed, "hex"), Buffer.from(expected, "hex"));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=meta-signature.js.map