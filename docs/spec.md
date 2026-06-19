## Summary
MotivoTestBot is a minimal Telegram bot (pipeline smoke-test) that sends one hardcoded motivational quote per subscriber every morning and supports immediate quote requests. Built with TypeScript + grammY following the bot-starter template.

## Audience
Telegram users who want a simple daily motivational quote. Intended as a minimal, testable pipeline: bot logic, a cron job, and a Postgres-backed subscribers table.

## Core entities
- Subscriber
  - chat_id (telegram chat id, BIGINT) — primary key
  - username (nullable TEXT)
  - subscribed_at (TIMESTAMPTZ)
- Quote
  - hardcoded array of ~40 motivational strings embedded in the source (e.g., src/quotes.ts)

## Integrations & notification targets
- Telegram Bot API (via grammY). Token provided in env var TELEGRAM_BOT_TOKEN.
- Postgres database. Connection via env var DATABASE_URL (standard libpq URI).
- Scheduler: in-process cron job using node-cron (or equivalent npm cron package) that fires once per day.

## Interaction flows
Commands (all plain-text responses):
- /start
  - Send short welcome text and the list of available commands (/subscribe, /unsubscribe, /quote).
- /subscribe
  - Insert or upsert subscriber row keyed by chat_id.
  - Reply with confirmation: "Subscribed — you'll receive one motivational quote every morning at 09:00 UTC." If already subscribed, reply idempotently: "You're already subscribed."
- /unsubscribe
  - Delete subscriber row for chat_id (no error if not present).
  - Reply with confirmation: "Unsubscribed — you will no longer receive daily quotes." If not subscribed, reply: "You are not subscribed."
- /quote
  - Immediately pick a random quote from the built-in list and send it.

Daily delivery flow (cron job):
- At 09:00 UTC each day the scheduler runs a job that:
  - SELECTs all chat_id values from subscribers.
  - For each chat_id, pick a random quote (from same hardcoded list) and send via bot.api.sendMessage(chat_id, quote).
  - Log failures to console; do not retry beyond a single send attempt for this minimal bot.

Message format: plain text (no HTML/Markdown special formatting required).

## Persistence
- One Postgres table named subscribers. Example schema:

  CREATE TABLE subscribers (
    chat_id BIGINT PRIMARY KEY,
    username TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT now()
  );

- Quotes stored in source code (e.g., src/quotes.ts) as an exported string[] of ~40 lines.

## Payments
- None.

## Non-goals
- No per-user timezone scheduling; all deliveries use a single UTC time.
- No external quote APIs, no auth flows, no admin UI, no analytics, no payment handling.
- No delivery retries/backoff beyond minimal error logging.

## Implementation notes (concrete)
- Tech stack: TypeScript, grammY, node-cron (or cron), pg (node-postgres), project follows the bot-starter template.
- Environment variables:
  - TELEGRAM_BOT_TOKEN (required)
  - DATABASE_URL (required)
- Docker: provide a simple Dockerfile to run the app as a single Node process (optional but recommended for deployment).
- Duplicate /subscribe requests are handled idempotently (INSERT ... ON CONFLICT DO NOTHING or upsert).
- The scheduler loops subscribers and sends messages sequentially (no batching); keep concurrency minimal for smoke-test.

## Assumptions & defaults
- Daily send time: 09:00 UTC — chosen for simplicity (no per-user timezones) and reproducible daily behavior.
- Timezone handling: single global UTC schedule (no per-user timezone field) — keeps schema and scheduler minimal.
- Scheduler: in-process cron (node-cron) running inside the bot process — keeps infra minimal for a smoke-test.
- Quotes storage: hardcoded array in src/quotes.ts with ~40 quotes — avoids external dependencies.
- Database schema: subscribers table with chat_id BIGINT primary key and subscribed_at timestamp — minimal persistent state as requested.
- Environment & hosting: expect TELEGRAM_BOT_TOKEN and DATABASE_URL as env vars; deploy as a single Node process (Docker recommended) — simplest deployment for pipeline testing.
- Duplicate subscribe/unsubscribe: idempotent behaviour (no errors if re-subscribing or unsubscribing when not present) — simplifies UX and implementation.