import type { FastifyInstance } from "fastify";
import { prisma } from "@linkbhejo/db";

const MAX_DAYS = 90;
const TIMELINE_ROW_LIMIT = 10_000;

export async function analyticsRoutes(app: FastifyInstance) {
  // GET /analytics/overview
  app.get<{ Querystring: { accountId?: string; days?: string } }>(
    "/overview",
    async (req, reply) => {
      const { userId } = (req as any).user;
      const { accountId, days = "30" } = req.query;

      const daysNum = parseDays(days);
      if (daysNum === null) {
        return reply.status(400).send({ success: false, error: "`days` must be a number between 1 and 90" });
      }

      const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
      const accountIds = await getAccountIds(userId, accountId);

      const [dmsSent, dmsDelivered, leadsCollected, activeAutomations] =
        await Promise.all([
          prisma.dmLog.count({
            where: { accountId: { in: accountIds }, createdAt: { gte: since } },
          }),
          prisma.dmLog.count({
            where: {
              accountId: { in: accountIds },
              status: "DELIVERED",
              createdAt: { gte: since },
            },
          }),
          prisma.lead.count({
            where: {
              accountId: { in: accountIds },
              deletedAt: null,
              createdAt: { gte: since },
            },
          }),
          prisma.automation.count({
            where: {
              accountId: { in: accountIds },
              status: "ACTIVE",
              deletedAt: null,
            },
          }),
        ]);

      const conversionRate =
        dmsSent > 0 ? Math.round((leadsCollected / dmsSent) * 100) : 0;

      return reply.send({
        success: true,
        data: {
          dmsSent,
          dmsDelivered,
          dmsReplied: 0,
          leadsCollected,
          conversionRate,
          activeAutomations,
          totalCommentTriggers: dmsSent,
        },
      });
    }
  );

  // GET /analytics/timeline — time-series data
  app.get<{ Querystring: { accountId?: string; days?: string } }>(
    "/timeline",
    async (req, reply) => {
      const { userId } = (req as any).user;
      const { accountId, days = "30" } = req.query;

      const daysNum = parseDays(days);
      if (daysNum === null) {
        return reply.status(400).send({ success: false, error: "`days` must be a number between 1 and 90" });
      }

      const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
      const accountIds = await getAccountIds(userId, accountId);

      // Hard-cap row count to prevent full-table scans on busy accounts
      const logs = await prisma.dmLog.findMany({
        where: {
          accountId: { in: accountIds },
          createdAt: { gte: since },
        },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
        take: TIMELINE_ROW_LIMIT,
      });

      // Group by day
      const byDay: Record<string, { dmsSent: number; dmsDelivered: number }> = {};

      for (const log of logs) {
        const day = log.createdAt.toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = { dmsSent: 0, dmsDelivered: 0 };
        byDay[day].dmsSent++;
        if (log.status === "DELIVERED") byDay[day].dmsDelivered++;
      }

      const timeline = Object.entries(byDay).map(([date, stats]) => ({
        date,
        ...stats,
        dmsReplied: 0,
      }));

      return reply.send({ success: true, data: timeline });
    }
  );

  // GET /analytics/automations — per-automation breakdown (single query, no N+1)
  app.get<{ Querystring: { accountId?: string } }>(
    "/automations",
    async (req, reply) => {
      const { userId } = (req as any).user;
      const { accountId } = req.query;

      const accountIds = await getAccountIds(userId, accountId);

      // Fetch automations with their DM log counts in a single query
      const automations = await prisma.automation.findMany({
        where: { accountId: { in: accountIds }, deletedAt: null },
        include: {
          _count: { select: { dmLogs: true } },
        },
        take: 100, // Safety cap
      });

      if (automations.length === 0) {
        return reply.send({ success: true, data: [] });
      }

      // Single grouped query for delivered counts — eliminates N+1
      const deliveredCounts = await prisma.dmLog.groupBy({
        by: ["automationId"],
        where: {
          automationId: { in: automations.map((a) => a.id) },
          status: "DELIVERED",
        },
        _count: { id: true },
      });

      const deliveredMap = new Map(
        deliveredCounts.map((d) => [d.automationId, d._count.id])
      );

      const results = automations.map((a) => ({
        automationId: a.id,
        automationName: a.name,
        automationType: a.type,
        dmsSent: a._count.dmLogs,
        dmsDelivered: deliveredMap.get(a.id) ?? 0,
        dmsReplied: 0,
        replyRate: 0,
      }));

      return reply.send({ success: true, data: results });
    }
  );
}

/** Parse and validate the `days` query parameter. Returns null if invalid. */
function parseDays(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > MAX_DAYS) return null;
  return n;
}

async function getAccountIds(userId: string, accountId?: string): Promise<string[]> {
  if (accountId) {
    // Verify the requesting user actually owns this account
    const account = await prisma.instagramAccount.findFirst({
      where: { id: accountId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!account) return []; // Return empty — don't 403, just show no data
    return [account.id];
  }
  const accounts = await prisma.instagramAccount.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
    take: 50, // A single user can't own more than 50 accounts anyway
  });
  return accounts.map((a) => a.id);
}
