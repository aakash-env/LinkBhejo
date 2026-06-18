import type { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../logger";
import { jwtVerify } from "jose";

const _JWT_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!_JWT_SECRET) {
  throw new Error("FATAL: AUTH_SECRET environment variable is not set. Refusing to start.");
}
const JWT_SECRET = _JWT_SECRET;

/**
 * Auth middleware — validates NextAuth JWT from Authorization header.
 * Attaches req.user = { userId, accountId, role, email }
 *
 * NextAuth v5 sessions can be verified via the NEXTAUTH_SECRET.
 * The web app sends the session token in the Authorization header.
 */
export async function authMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ success: false, error: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    // Verify the JWT signature securely
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload || !payload.sub) {
      return reply.status(401).send({ success: false, error: "Invalid token" });
    }

    (req as any).user = {
      userId: payload.sub,
      accountId: payload.accountId ?? null,
      role: payload.role ?? "OWNER",
      email: payload.email ?? null,
    };
  } catch (err) {
    logger.warn("Auth middleware error", { error: (err as Error).message });
    return reply.status(401).send({ success: false, error: "Unauthorized" });
  }
}
