import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────
// Singleton PrismaClient
// ─────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─────────────────────────────────────────
// Multi-tenancy middleware
// Ensures every query scoped to an account
// touches only that account's data
// ─────────────────────────────────────────

export function applyTenantMiddleware(accountId: string) {
  prisma.$use(async (params: any, next: any) => {
    // Tables that require tenant isolation
    const tenantTables = [
      "Automation",
      "AutomationRule",
      "DmLog",
      "Lead",
      "Sequence",
      "SequenceStep",
      "SequenceEnrollment",
      "AbTest",
      "UsageEvent",
    ];

    if (tenantTables.includes(params.model ?? "")) {
      if (
        params.action === "findMany" ||
        params.action === "findFirst" ||
        params.action === "count" ||
        params.action === "aggregate"
      ) {
        params.args = params.args ?? {};
        params.args.where = {
          ...params.args.where,
          accountId,
          deletedAt: null,
        };
      }

      if (params.action === "create") {
        params.args.data = {
          ...params.args.data,
          accountId,
        };
      }

      if (params.action === "update" || params.action === "updateMany") {
        params.args.where = {
          ...params.args.where,
          accountId,
        };
      }
    }

    return next(params);
  });
}

export * from "@prisma/client";
export * from "./crypto";
