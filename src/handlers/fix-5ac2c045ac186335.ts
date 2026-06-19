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
        "[agntdev-bot] cron: BOT_TOKEN not set, cannot send daily message",
      );
      return;
    }
    const api = new Api(token);
    const chatIds = await getAllChatIds();
    for (const chatId of chatIds) {
      try {
        await api.sendMessage(
          chatId,
          `🌅 Good morning!\n\n📜 Daily Quote:\n\n${pickQuote()}`,
        );
      } catch (e: unknown) {
        console.error(
          `[agntdev-bot] cron: failed to send daily message to chat ${chatId}`,
          e,
        );
      }
    }
  },
  { timezone: "UTC" },
);

const composer = new Composer();

export default composer;
