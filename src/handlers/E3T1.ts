import { Composer, Api } from "grammy";
import cron from "node-cron";
import { getSubscriberStorage } from "./fix-631f6847412d06b0.js";

interface Subscriber {
  userId: number;
  chatId: number;
  subscribedAt: string;
}

const subscribers = getSubscriberStorage();

cron.schedule(
  "0 9 * * *",
  async () => {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      console.error("[agntdev-bot] cron: BOT_TOKEN not set, cannot send daily messages");
      return;
    }
    const api = new Api(token);
    for await (const key of subscribers.readAllKeys()) {
      const sub = await subscribers.read(key) as Subscriber | undefined;
      if (sub) {
        try {
          await api.sendMessage(
            sub.chatId,
            "Good morning! Here's your daily update.",
          );
        } catch (e: unknown) {
          console.error(
            `[agntdev-bot] cron: failed to send daily message to chat ${sub.chatId}`,
            e,
          );
        }
      }
    }
  },
  { timezone: "UTC" },
);

const composer = new Composer();

export default composer;
