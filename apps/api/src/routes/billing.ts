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

    let subscription = await prisma.subscription.findUnique({
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
  app.post("/stripe-webhook", {
    config: { rawBody: true },
  }, async (req, reply) => {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody as Buffer;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? ""
      );
    } catch (err) {
      logger.warn("Stripe webhook signature failed", { error: (err as Error).message });
      return reply.status(400).send("Webhook signature failed");
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: mapStripeStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          create: {
            userId,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            plan: "PRO",
            status: mapStripeStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            limits: { dmsPerMonth: -1, maxAccounts: 3, aiEnabled: true, sequencesEnabled: true },
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: { status: "CANCELED", plan: "FREE" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn("Payment failed", { customerId: invoice.customer });
        // TODO: send email via Resend
        break;
      }
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
