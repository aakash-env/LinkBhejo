import type { FastifyInstance } from "fastify";
import { prisma } from "@linkbhejo/db";
import { stringify } from "csv-stringify/sync";

export async function leadRoutes(app: FastifyInstance) {
  // GET /leads — paginated list with filters
  app.get<{
    Querystring: {
      accountId?: string;
      page?: string;
      pageSize?: string;
      search?: string;
      source?: string;
    };
  }>("/", async (req, reply) => {
    const { userId } = (req as any).user;
    const {
      accountId,
      page = "1",
      pageSize = "20",
      search,
      source,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSizeNum = Math.min(100, parseInt(pageSize, 10));
    const skip = (pageNum - 1) * pageSizeNum;

    // Verify account belongs to user
    let accountFilter: any = {};
    if (accountId) {
      const account = await prisma.instagramAccount.findFirst({
        where: { id: accountId, userId, deletedAt: null },
      });
      if (!account) {
        return reply.status(403).send({ success: false, error: "Forbidden" });
      }
      accountFilter = { accountId };
    } else {
      // Get all accounts for this user
      const accounts = await prisma.instagramAccount.findMany({
        where: { userId, deletedAt: null },
        select: { id: true },
      });
      accountFilter = { accountId: { in: accounts.map((a) => a.id) } };
    }

    const where: any = {
      ...accountFilter,
      deletedAt: null,
      ...(search && {
        OR: [
          { igUsername: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(source && { source }),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lead.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: leads,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: skip + pageSizeNum < total,
    });
  });

  // GET /leads/export — CSV download
  app.get<{ Querystring: { accountId?: string } }>("/export", async (req, reply) => {
    const { userId } = (req as any).user;
    const { accountId } = req.query;

    let accountFilter: any = {};
    if (accountId) {
      const account = await prisma.instagramAccount.findFirst({
        where: { id: accountId, userId, deletedAt: null },
      });
      if (!account) {
        return reply.status(403).send({ success: false, error: "Forbidden" });
      }
      accountFilter = { accountId };
    } else {
      const accounts = await prisma.instagramAccount.findMany({
        where: { userId, deletedAt: null },
        select: { id: true },
      });
      accountFilter = { accountId: { in: accounts.map((a) => a.id) } };
    }

    const leads = await prisma.lead.findMany({
      where: { ...accountFilter, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const csv = stringify(leads, {
      header: true,
      columns: [
        { key: "igUsername", header: "Instagram Username" },
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "source", header: "Source" },
        { key: "createdAt", header: "Created At" },
      ],
    });

    reply
      .header("Content-Type", "text/csv")
      .header(
        "Content-Disposition",
        `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`
      )
      .send(csv);
  });

  // DELETE /leads/:id
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const { userId } = (req as any).user;
    const { id } = req.params;

    // Verify ownership via account
    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: { account: { select: { userId: true } } },
    });

    if (!lead || lead.account.userId !== userId) {
      return reply.status(404).send({ success: false, error: "Lead not found" });
    }

    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return reply.send({ success: true, message: "Lead deleted" });
  });
}
