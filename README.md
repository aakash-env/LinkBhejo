# LinkBhejo — Instagram DM Automation SaaS

> **Automate Instagram DMs 24/7.** Detect keywords in comments, story replies, and live sessions — then send personalized direct messages automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| API | Fastify, Node.js 20 |
| Queue | BullMQ + Redis 7 |
| Database | PostgreSQL 16, Prisma ORM |
| Auth | NextAuth v5 (Instagram OAuth + email) |
| AI | Claude Sonnet 4 (Anthropic) |
| Payments | Stripe + Razorpay |
| Email | Resend |
| Storage | Cloudflare R2 |
| Monitoring | Sentry, PostHog |

---

## Project Structure

```
apps/
  web/       # Next.js 14 dashboard
  api/       # Fastify REST API + BullMQ workers
packages/
  db/        # Prisma schema + client
  types/     # Shared TypeScript types
  utils/     # Crypto, rate limiting, webhook signature
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for local Postgres + Redis)

### 1. Clone and install

```bash
git clone https://github.com/your-org/linkbhejo.git
cd linkbhejo
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Fill in all required values (see .env.example for details)
```

### 3. Start local services

```bash
docker-compose up -d
# Starts PostgreSQL on :5432 and Redis on :6379
```

### 4. Initialize database

```bash
pnpm db:push    # Apply Prisma schema
pnpm db:seed    # Seed demo data
```

### 5. Run development servers

```bash
# Terminal 1: API server
pnpm dev:api     # http://localhost:3001

# Terminal 2: BullMQ workers
pnpm dev:worker

# Terminal 3: Next.js frontend
pnpm dev:web     # http://localhost:3000
```

### 6. Expose webhook for Meta

```bash
ngrok http 3001
# Set https://<ngrok-url>/webhooks/instagram in Meta Developer Console
```

---

## Environment Variables

See `.env.example` for the complete list. Required for basic functionality:

```env
META_APP_ID=              # Meta Developer App ID
META_APP_SECRET=          # Meta App Secret
META_WEBHOOK_VERIFY_TOKEN= # Random string you set in Meta Console
META_WEBHOOK_SECRET=      # Meta Webhook Secret (for signature verification)

DATABASE_URL=             # PostgreSQL connection string
REDIS_URL=                # Redis connection string

NEXTAUTH_SECRET=          # Run: openssl rand -base64 32
NEXTAUTH_URL=             # http://localhost:3000 (or production URL)
NEXT_PUBLIC_API_URL=      # http://localhost:3001

ENCRYPTION_KEY=           # Run: openssl rand -base64 32
```

---

## Meta App Review Checklist

Before going live, you must complete Meta's App Review process:

- [ ] **Business Verification** — Verify your business on Meta Business Manager
- [ ] **Privacy Policy** — Publish a GDPR-compliant privacy policy at `/privacy`
- [ ] **Data Deletion Callback** — Implement the callback at `/api/meta/data-deletion`
- [ ] **Permission: `instagram_manage_messages`** — Submit with video demo showing:
  - User commenting on a post
  - Your app detecting the comment
  - DM being sent within 24 hours of user action
- [ ] **Permission: `instagram_manage_comments`** — Submit for comment reply feature
- [ ] **Permission: `pages_messaging`** — Submit for DM automation
- [ ] **Permission: `instagram_basic`** — Required for account info
- [ ] **Webhook configured** — Set verified endpoint in Meta Developer Console
- [ ] **Test user added** — Add test users for App Review submission
- [ ] **24-hour window** — Document that DMs are only sent within 24h of user action
- [ ] **Rate limiting demonstrated** — Note the 200 calls/hr per account limit in submission

---

## API Documentation

### Webhook Events
```
GET  /webhooks/instagram  → Meta verification challenge
POST /webhooks/instagram  → Receive events (comments, messages, story replies, live)
```

### Automations
```
GET    /automations           → List automations
POST   /automations           → Create automation
GET    /automations/:id       → Get automation with logs
PATCH  /automations/:id       → Update automation
DELETE /automations/:id       → Soft delete
POST   /automations/:id/toggle    → Pause / resume
POST   /automations/:id/retrigger → Re-run on old post
```

### Analytics
```
GET /analytics/overview    → KPI summary
GET /analytics/timeline    → Time-series chart data
GET /analytics/automations → Per-automation breakdown
```

### Leads
```
GET    /leads         → Paginated list with search
GET    /leads/export  → CSV download
DELETE /leads/:id     → Delete lead
```

### Billing
```
GET  /billing/usage           → Current plan & usage
POST /billing/create-checkout → Stripe checkout session
POST /billing/portal          → Stripe customer portal
POST /billing/stripe-webhook  → Stripe webhook handler
```

---

## Security

- All Meta access tokens encrypted at rest with **AES-256-GCM**
- Webhook signatures verified via **HMAC-SHA256** (`X-Hub-Signature-256`)
- Rate limiting: **200 API calls/hour per Instagram account** (Redis sliding window)
- Multi-tenancy enforced via **Prisma middleware** — all queries scoped to `accountId`
- **JWT RS256** session tokens via NextAuth v5
- **24-hour messaging window** enforced at worker level before every DM send

---

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
# Set environment variables in Vercel dashboard
```

### API + Workers (Railway)
```bash
railway up
# Uses Dockerfile in apps/api/
```

### Database
- **Dev**: Docker Compose PostgreSQL
- **Prod**: Neon (serverless) or AWS RDS

### Redis
- **Dev**: Docker Compose Redis
- **Prod**: Upstash (serverless, per-request billing)

---

## License

MIT © LinkBhejo
