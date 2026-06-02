import type { FastifyInstance } from "fastify";
import { prisma } from "@linkbhejo/db";
import { logger } from "../logger";

export async function accountRoutes(app: FastifyInstance) {
  // GET /accounts — list connected Instagram accounts
  app.get("/", async (req, reply) => {
    const { userId } = (req as any).user;

    const accounts = await prisma.instagramAccount.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        igUserId: true,
        igUsername: true,
        igName: true,
        profilePictureUrl: true,
        followersCount: true,
        followingCount: true,
        mediaCount: true,
        tokenExpiresAt: true,
        createdAt: true,
        _count: {
          select: { automations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({ success: true, data: accounts });
  });

  // GET /accounts/:id/stats — DM stats for a specific account
  app.get<{ Params: { id: string } }>("/:id/stats", async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params;

    const account = await prisma.instagramAccount.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!account) {
      return reply.status(404).send({ success: false, error: "Account not found" });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const [dmsSent, dmsDelivered, activeAutomations, totalLeads] = await Promise.all([
      prisma.dmLog.count({ where: { accountId: id } }),
      prisma.dmLog.count({ where: { accountId: id, status: "DELIVERED" } }),
      prisma.automation.count({ where: { accountId: id, status: "ACTIVE", deletedAt: null } }),
      prisma.lead.count({ where: { accountId: id, deletedAt: null } }),
    ]);

    const usageEvent = await prisma.usageEvent.findUnique({
      where: {
        accountId_type_month: {
          accountId: id,
          type: "dm_sent",
          month: currentMonth,
        },
      },
    });

    return reply.send({
      success: true,
      data: {
        dmsSent,
        dmsDelivered,
        activeAutomations,
        totalLeads,
        currentMonthDms: usageEvent?.count ?? 0,
      },
    });
  });

  // DELETE /accounts/:id — disconnect Instagram account
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params;

    const account = await prisma.instagramAccount.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!account) {
      return reply.status(404).send({ success: false, error: "Account not found" });
    }

    // Pause all automations first
    await prisma.automation.updateMany({
      where: { accountId: id },
      data: { status: "PAUSED" },
    });

    // Soft delete account
    await prisma.instagramAccount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info("Instagram account disconnected", { accountId: id, userId });
    return reply.send({ success: true, message: "Account disconnected" });
  });
}
