import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Middleware } from "grammy";
import { type BotContext, createBot } from "./toolkit/index.js";

// The per-chat session shape (ephemeral conversation state only). Extend as the
// bot grows. Durable domain data must NOT live here — use the toolkit's
// persistent storage (see AGENTS.md).
export interface Session {
  // example: step?: "awaiting_amount";
}

/**
 * buildBot — assembles the bot and registers every handler, but does NOT start
 * it. Shared by the runtime entry (src/index.ts) and the Tests-gate harness
 * (src/harness-entry.ts) so both exercise the exact same bot. Add new commands
 * and flows here.
 */
export function buildBot(token: string) {
  const bot = createBot<Session>(token, {
    initial: () => ({}),
  });

  loadHandlers(bot);

  return bot;
}

function loadHandlers(bot: ReturnType<typeof createBot<Session>>): void {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const handlersDir = resolve(__dirname, "handlers");
  let files: string[];
  try {
    files = readdirSync(handlersDir).filter((f) => f.endsWith(".js"));
  } catch {
    return;
  }
  for (const file of files) {
    import(`./handlers/${file}`)
      .then((mod: { default?: unknown }) => {
        if (mod.default) {
          bot.use(mod.default as Middleware<BotContext<Session>>);
        }
      })
      .catch((e: unknown) => {
        console.error(`[agntdev-bot] failed to load handler ${file}:`, e);
      });
  }
}
