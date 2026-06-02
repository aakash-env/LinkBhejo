import axios, { type AxiosInstance } from "axios";
import { Redis } from "ioredis";
import { prisma, decryptToken } from "@linkbhejo/db";
import { checkRateLimit } from "@linkbhejo/utils/rate-limit";
import { logger } from "../logger";

const META_API_VERSION = "v19.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaClient {
  private http: AxiosInstance;
  private redis: Redis;
  private accessToken: string;
  private igUserId: string;
  private accountId: string;

  constructor(accessToken: string, igUserId: string, accountId: string, redis: Redis) {
    this.accessToken = accessToken;
    this.igUserId = igUserId;
    this.accountId = accountId;
    this.redis = redis;
    this.http = axios.create({
      baseURL: META_BASE_URL,
      timeout: 10000,
    });
  }

  /** Static factory — loads and decrypts token from DB */
  static async fromAccountId(accountId: string, redis: Redis): Promise<MetaClient> {
    const account = await prisma.instagramAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error(`Instagram account not found: ${accountId}`);
    }

    const token = decryptToken(account.encryptedAccessToken);
    return new MetaClient(token, account.igUserId, accountId, redis);
  }

  // ─────────────────────────────────────────
  // Rate limit check
  // ─────────────────────────────────────────
  private async enforceRateLimit(): Promise<void> {
    const { allowed, remaining, resetAt } = await checkRateLimit(
      this.redis,
      this.accountId,
      200,           // 200 calls/hour
      60 * 60 * 1000 // 1 hour window
    );

    if (!allowed) {
      const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
      throw new MetaRateLimitError(
        `Rate limit exceeded for account ${this.accountId}. Reset in ${resetIn}s`
      );
    }

    logger.debug("Rate limit check passed", { remaining, accountId: this.accountId });
  }

  // ─────────────────────────────────────────
  // Send a Direct Message
  // ─────────────────────────────────────────
  async sendDm(
    recipientIgUserId: string,
    message: string,
    mediaUrl?: string
  ): Promise<{ messageId: string }> {
    await this.enforceRateLimit();

    const body: any = {
      recipient: { id: recipientIgUserId },
      message: { text: message },
    };

    if (mediaUrl) {
      body.message = {
        attachment: {
          type: "image",
          payload: { url: mediaUrl, is_reusable: true },
        },
      };
    }

    try {
      const response = await this.http.post(
        `/${this.igUserId}/messages`,
        body,
        { params: { access_token: this.accessToken } }
      );

      logger.info("DM sent successfully", {
        recipient: recipientIgUserId,
        messageId: response.data.message_id,
      });

      return { messageId: response.data.message_id };
    } catch (err: any) {
      this.handleApiError(err);
    }
  }

  // ─────────────────────────────────────────
  // Reply to a comment
  // ─────────────────────────────────────────
  async replyToComment(mediaId: string, replyText: string): Promise<void> {
    await this.enforceRateLimit();

    try {
      await this.http.post(
        `/${mediaId}/comments`,
        { message: replyText },
        { params: { access_token: this.accessToken } }
      );
      logger.info("Comment reply posted", { mediaId });
    } catch (err: any) {
      this.handleApiError(err);
    }
  }

  // ─────────────────────────────────────────
  // Get commenters for a post (paginated)
  // ─────────────────────────────────────────
  async getCommenters(
    mediaId: string,
    cursor?: string
  ): Promise<{ commenters: Array<{ id: string; username: string; text: string }>; nextCursor?: string }> {
    await this.enforceRateLimit();

    const params: any = {
      fields: "id,from,message,timestamp",
      limit: 50,
      access_token: this.accessToken,
    };
    if (cursor) params.after = cursor;

    const response = await this.http.get(`/${mediaId}/comments`, { params });
    const data = response.data;

    const commenters = (data.data ?? []).map((c: any) => ({
      id: c.from?.id ?? c.id,
      username: c.from?.username ?? "",
      text: c.message ?? "",
    }));

    const nextCursor = data.paging?.cursors?.after;
    return { commenters, nextCursor };
  }

  // ─────────────────────────────────────────
  // Check if user follows the account
  // ─────────────────────────────────────────
  async checkFollowStatus(targetUserId: string): Promise<boolean> {
    await this.enforceRateLimit();

    try {
      const response = await this.http.get(`/${this.igUserId}/followers`, {
        params: {
          user_id: targetUserId,
          access_token: this.accessToken,
        },
      });
      return (response.data.data?.length ?? 0) > 0;
    } catch {
      // API doesn't support follower lookup — default to not following
      return false;
    }
  }

  // ─────────────────────────────────────────
  // Refresh long-lived token
  // ─────────────────────────────────────────
  async refreshToken(): Promise<string> {
    const response = await this.http.get("/oauth/access_token", {
      params: {
        grant_type: "ig_refresh_token",
        access_token: this.accessToken,
      },
    });
    return response.data.access_token;
  }

  // ─────────────────────────────────────────
  // Error handler — maps Meta errors to typed errors
  // ─────────────────────────────────────────
  private handleApiError(err: any): never {
    const status = err.response?.status;
    const metaError = err.response?.data?.error;

    logger.error("Meta API error", {
      status,
      code: metaError?.code,
      message: metaError?.message,
      accountId: this.accountId,
    });

    if (status === 429) {
      throw new MetaRateLimitError(metaError?.message ?? "Rate limited");
    }

    if (status === 400) {
      throw new MetaBadRequestError(
        metaError?.message ?? "Bad request",
        metaError?.code
      );
    }

    if (status >= 500) {
      throw new MetaServerError(metaError?.message ?? "Meta server error");
    }

    throw new Error(`Meta API error: ${metaError?.message ?? err.message}`);
  }
}

// ─────────────────────────────────────────
// Typed Meta errors
// ─────────────────────────────────────────
export class MetaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaRateLimitError";
  }
}

export class MetaBadRequestError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "MetaBadRequestError";
    this.code = code;
  }
}

export class MetaServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaServerError";
  }
}
