import { Composer, Api } from "grammy";
import cron from "node-cron";
import { QUOTES } from "../quotes.js";
import { getAllChatIds } from "../store/subscriptions.js";

function pickQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

cron.schedule(
  "0 9 * * *",
  async () => {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      console.error(
        "[agntdev-bot] cron: BOT_TOKEN not set, cannot send daily quotes",
      );
      return;
    }
    const api = new Api(token);
    const chatIds = await getAllChatIds();
    for (const chatId of chatIds) {
      try {
        await api.sendMessage(
          chatId,
          `📜 Daily Quote:\n\n${pickQuote()}`,
        );
      } catch (e: unknown) {
        console.error(
          `[agntdev-bot] cron: failed to send daily quote to chat ${chatId}`,
          e,
        );
      }
    }
  },
  { timezone: "UTC" },
);

const composer = new Composer();

export default composer;