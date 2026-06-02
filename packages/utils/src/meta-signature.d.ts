/**
 * Verify Meta webhook X-Hub-Signature-256 header
 * @param rawBody  Raw request body as Buffer
 * @param signature  Value of X-Hub-Signature-256 header (e.g. "sha256=abc123")
 * @param secret  META_WEBHOOK_SECRET env var
 */
export declare function verifyWebhookSignature(rawBody: Buffer, signature: string, secret: string): boolean;
//# sourceMappingURL=meta-signature.d.ts.map