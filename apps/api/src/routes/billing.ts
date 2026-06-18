import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { prisma } from "@linkbhejo/db";
import { logger } from "../logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export async function billingRoutes(app: FastifyInstance) {
  // GET /billing/usage — current usage vs. plan limits
  app.get("/usage", async (req, reply) => {
    const { userId } = (req as any).user;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return reply.send({
        success: true,
        data: { plan: "FREE", limits: { dmsPerMonth: 50 }, usage: { dmsSent: 0 } },
      });
    }

    const accounts = await prisma.instagramAccount.findMany({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);

    const usageEvents = await prisma.usageEvent.findMany({
      where: {
        accountId: { in: accountIds },
        type: "dm_sent",
        month: currentMonth,
      },
    });

    const totalDms = usageEvents.reduce((sum, e) => sum + e.count, 0);

    return reply.send({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        limits: subscription.limits,
        usage: {
          dmsSent: totalDms,
          accountsConnected: accountIds.length,
        },
      },
    });
  });

  // POST /billing/create-checkout — Stripe checkout
  app.post<{
    Body: { plan: "PRO" | "AGENCY"; successUrl: string; cancelUrl: string };
  }>("/create-checkout", async (req, reply) => {
    const { userId } = (req as any).user;
    const { plan, successUrl, cancelUrl } = req.body as any;

    const priceId =
      plan === "PRO"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_AGENCY_PRICE_ID;

    if (!priceId) {
      return reply.status(500).send({ success: false, error: "Price not configured" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ success: false, error: "User not found" });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Get or create Stripe customer
    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId },
      },
    });

    return reply.send({ success: true, data: { url: session.url } });
  });

  // POST /billing/portal — Stripe customer portal
  app.post<{ Body: { returnUrl: string } }>("/portal", async (req, reply) => {
    const { userId } = (req as any).user;
    const { returnUrl } = req.body as any;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      return reply.status(400).send({ success: false, error: "No Stripe customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return reply.send({ success: true, data: { url: session.url } });
  });

  // POST /billing/stripe-webhook — handle Stripe events
  // NOTE: This route lives inside protectedApp but Stripe sends no JWT.
  // We rely solely on stripe-signature verification for auth here.
  app.post("/stripe-webhook", {
    config: { rawBody: true },
  }, async (req, reply) => {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody as Buffer;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET is not configured — rejecting all webhook events");
      return reply.status(500).send("Webhook not configured");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      logger.warn("Stripe webhook signature failed", { error: (err as Error).message });
      return reply.status(400).send("Webhook signature failed");
    }

    logger.info("Stripe webhook received", { type: event.type, id: event.id });

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) {
          logger.warn("Stripe subscription event missing userId metadata", { subId: sub.id });
          break;
        }

        const mappedStatus = mapStripeStatus(sub.status);
        // Determine plan from price ID
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId === process.env.STRIPE_AGENCY_PRICE_ID ? "AGENCY" : "PRO";
        const limits = plan === "AGENCY"
          ? { dmsPerMonth: -1, maxAccounts: -1, aiEnabled: true, sequencesEnabled: true }
          : { dmsPerMonth: -1, maxAccounts: 3, aiEnabled: true, sequencesEnabled: true };

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            plan: mappedStatus === "CANCELED" ? "FREE" : plan,
            status: mappedStatus,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            limits: mappedStatus === "CANCELED" ? { dmsPerMonth: 50, maxAccounts: 1, aiEnabled: false, sequencesEnabled: false } : limits,
          },
          create: {
            userId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            stripePriceId: priceId,
            plan,
            status: mappedStatus,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            limits,
          },
        });
        logger.info("Subscription upserted", { userId, plan, status: mappedStatus });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: {
            status: "CANCELED",
            plan: "FREE",
            limits: { dmsPerMonth: 50, maxAccounts: 1, aiEnabled: false, sequencesEnabled: false },
          },
        });
        logger.info("Subscription canceled — downgraded to FREE", { userId });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        logger.warn("Payment failed", { customerId, invoiceId: invoice.id });

        if (customerId) {
          // Mark subscription as PAST_DUE so dashboard shows a warning
          const subscription = await prisma.subscription.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "PAST_DUE" },
            });
            logger.info("Subscription marked PAST_DUE", { userId: subscription.userId });
          }
        }
        // TODO: trigger email via Resend to notify user
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        if (customerId && invoice.billing_reason !== "subscription_create") {
          // Reset PAST_DUE back to ACTIVE on successful payment
          const subscription = await prisma.subscription.findFirst({
            where: { stripeCustomerId: customerId, status: "PAST_DUE" },
          });
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "ACTIVE" },
            });
            logger.info("Subscription restored to ACTIVE after payment", { userId: subscription.userId });
          }
        }
        break;
      }

      default:
        logger.debug("Unhandled Stripe event type", { type: event.type });
    }

    return reply.status(200).send("OK");
  });
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (status) {
    case "active": return "ACTIVE";
    case "trialing": return "TRIALING";
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELED";
    default: return "INCOMPLETE";
  }
}

