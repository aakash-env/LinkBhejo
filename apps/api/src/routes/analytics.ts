import type { FastifyInstance } from "fastify";
import { prisma } from "@linkbhejo/db";

export async function analyticsRoutes(app: FastifyInstance) {
  // GET /analytics/overview
  app.get<{ Querystring: { accountId?: string; days?: string } }>(
    "/overview",
    async (req, reply) => {
      const { userId } = (req as any).user;
      const { accountId, days = "30" } = req.query;
      const daysNum = parseInt(days, 10);
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
          dmsReplied: 0, // TODO: track via webhook
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
      const daysNum = parseInt(days, 10);
      const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

      const accountIds = await getAccountIds(userId, accountId);

      const logs = await prisma.dmLog.findMany({
        where: {
          accountId: { in: accountIds },
          createdAt: { gte: since },
        },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
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

  // GET /analytics/automations — per-automation breakdown
  app.get<{ Querystring: { accountId?: string } }>(
    "/automations",
    async (req, reply) => {
      const { userId } = (req as any).user;
      const { accountId } = req.query;

      const accountIds = await getAccountIds(userId, accountId);

      const automations = await prisma.automation.findMany({
        where: { accountId: { in: accountIds }, deletedAt: null },
        include: {
          _count: {
            select: {
              dmLogs: true,
            },
          },
        },
      });

      const results = await Promise.all(
        automations.map(async (a) => {
          const delivered = await prisma.dmLog.count({
            where: { automationId: a.id, status: "DELIVERED" },
          });
          const total = a._count.dmLogs;
          return {
            automationId: a.id,
            automationName: a.name,
            automationType: a.type,
            dmsSent: total,
            dmsDelivered: delivered,
            dmsReplied: 0,
            replyRate: 0,
          };
        })
      );

      return reply.send({ success: true, data: results });
    }
  );
}

async function getAccountIds(userId: string, accountId?: string): Promise<string[]> {
  if (accountId) return [accountId];
  const accounts = await prisma.instagramAccount.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  return accounts.map((a) => a.id);
}
