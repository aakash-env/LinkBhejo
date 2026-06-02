import { prisma } from "./src/index";
import { encryptToken } from "./src/crypto";
import type {
  AutomationType,
  AutomationStatus,
  SubscriptionPlan,
} from "@prisma/client";

async function main() {
  console.log("🌱 Seeding LinkBhejo database...");

  // Clean up existing data
  await prisma.dmLog.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.instagramAccount.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@linkbhejo.com",
      name: "Demo Creator",
      passwordHash: "$2b$10$JAvEyKMFC3tE1iOTvYA/QuTQp.vTdshWd2YFJBNh1HL52CUlPg83O", // password123
      role: "OWNER",
    },
  });
  console.log("✅ Created user:", user.email);

  // Create subscription (Pro trial)
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: "PRO" as SubscriptionPlan,
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      limits: {
        dmsPerMonth: -1, // unlimited
        maxAccounts: 3,
        aiEnabled: true,
        sequencesEnabled: true,
      },
    },
  });
  console.log("✅ Created Pro trial subscription");

  // Create demo Instagram account
  const demoToken = encryptToken("demo_access_token_not_real");
  const account = await prisma.instagramAccount.create({
    data: {
      userId: user.id,
      igUserId: "17841400000000000",
      igUsername: "demo_creator",
      igName: "Demo Creator",
      encryptedAccessToken: demoToken,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      followersCount: 12500,
      followingCount: 345,
      mediaCount: 87,
    },
  });
  console.log("✅ Created Instagram account:", account.igUsername);

  // Create comment automation
  const commentAutomation = await prisma.automation.create({
    data: {
      accountId: account.id,
      name: "Free Guide Giveaway",
      type: "COMMENT" as AutomationType,
      status: "ACTIVE" as AutomationStatus,
      watchAllPosts: false,
      postId: "17841400000000001",
      dmTemplate:
        "Hey {name}! 👋 Here's your free guide: https://linkbhejo.com/guide\n\nLet me know if you have any questions!",
      commentReplyEnabled: true,
      commentReplyTemplate: "Sent you the link! Check your DMs 📩",
      delaySeconds: 5,
      followGate: false,
      rules: {
        create: [
          { keyword: "link", matchType: "CONTAINS", caseSensitive: false },
          { keyword: "send", matchType: "CONTAINS", caseSensitive: false },
          { keyword: "info", matchType: "CONTAINS", caseSensitive: false },
          { keyword: "guide", matchType: "CONTAINS", caseSensitive: false },
        ],
      },
    },
  });
  console.log("✅ Created comment automation:", commentAutomation.name);

  // Create DM reply automation
  await prisma.automation.create({
    data: {
      accountId: account.id,
      name: "DM Keyword Auto-Reply",
      type: "DM_REPLY" as AutomationType,
      status: "ACTIVE" as AutomationStatus,
      dmTemplate:
        "Thanks for reaching out! 🙏 I'll get back to you within 24 hours. In the meantime, check out my latest post!",
      rules: {
        create: [
          { keyword: "price", matchType: "CONTAINS", caseSensitive: false },
          {
            keyword: "collab",
            matchType: "CONTAINS",
            caseSensitive: false,
          },
        ],
      },
    },
  });
  console.log("✅ Created DM reply automation");

  // Create sample DM logs
  const sampleUsers = [
    { igUserId: "111111", igUsername: "user_one" },
    { igUserId: "222222", igUsername: "user_two" },
    { igUserId: "333333", igUsername: "user_three" },
    { igUserId: "444444", igUsername: "user_four" },
    { igUserId: "555555", igUsername: "user_five" },
  ];

  for (const u of sampleUsers) {
    await prisma.dmLog.create({
      data: {
        automationId: commentAutomation.id,
        accountId: account.id,
        igUserId: u.igUserId,
        igUsername: u.igUsername,
        messageText: commentAutomation.dmTemplate,
        status: "DELIVERED",
        triggerType: "comment",
        triggerPostId: "17841400000000001",
        triggeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("✅ Created 5 sample DM logs");

  // Create sample leads
  await prisma.lead.createMany({
    data: [
      {
        accountId: account.id,
        igUserId: "111111",
        igUsername: "user_one",
        name: "Alice Johnson",
        email: "alice@example.com",
        source: "Free Guide Giveaway",
      },
      {
        accountId: account.id,
        igUserId: "222222",
        igUsername: "user_two",
        name: "Bob Smith",
        email: "bob@example.com",
        source: "Free Guide Giveaway",
      },
    ],
  });
  console.log("✅ Created 2 sample leads");

  // Usage event for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.usageEvent.create({
    data: {
      accountId: account.id,
      type: "dm_sent",
      month: currentMonth,
      count: 5,
    },
  });
  console.log("✅ Created usage event for", currentMonth);

  console.log("\n🎉 Seeding complete!");
  console.log("   Email: demo@linkbhejo.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
