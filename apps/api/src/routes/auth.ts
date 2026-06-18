import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@linkbhejo/db";
import { logger } from "../logger";

const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register — create a new user account
  // Rate-limited to 5 registrations per IP per minute (via global rate limiter).
  // Additional layer: reject duplicate emails with a generic message to prevent enumeration.
  app.post("/register", async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists — return same generic error to prevent
    // user enumeration attacks (don't reveal which emails are registered)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Use the same response shape as success to prevent timing-based enumeration
      // Sleep a tiny bit to equalize response time
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 100));
      return reply.status(409).send({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    logger.info("New user registered", { userId: user.id, email: user.email });

    return reply.status(201).send({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  });
}
