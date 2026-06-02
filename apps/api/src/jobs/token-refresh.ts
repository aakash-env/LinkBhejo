import cron from "node-cron";
import { prisma, encryptToken } from "@linkbhejo/db";
import { MetaClient } from "../services/meta";
import { redis } from "../index";
import { logger } from "../logger";

/**
 * Token refresh cron — runs daily at 2am.
 * Refreshes Instagram access tokens expiring within 7 days.
 */
export function startTokenRefreshJob() {
  cron.schedule("0 2 * * *", async () => {
    logger.info("Token refresh cron started");

    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const expiringAccounts = await prisma.instagramAccount.findMany({
      where: {
        tokenExpiresAt: { lte: sevenDaysFromNow },
        deletedAt: null,
      },
    });

    logger.info(`Found ${expiringAccounts.length} accounts needing token refresh`);

    for (const account of expiringAccounts) {
      try {
        const metaClient = await MetaClient.fromAccountId(account.id, redis);
        const newToken = await metaClient.refreshToken();
        const encrypted = encryptToken(newToken);

        await prisma.instagramAccount.update({
          where: { id: account.id },
          data: {
            encryptedAccessToken: encrypted,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          },
        });

        logger.info("Token refreshed", {
          accountId: account.id,
          igUsername: account.igUsername,
        });
      } catch (err) {
        logger.error("Token refresh failed", {
          accountId: account.id,
          error: (err as Error).message,
        });
        // TODO: Send alert email to user
      }
    }
  });

  logger.info("Token refresh cron scheduled (daily 2am)");
}
