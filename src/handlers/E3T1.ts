import { createRequire } from "node:module";
import { Composer, Api } from "grammy";
import cron from "node-cron";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

interface Subscriber {
  userId: number;
  chatId: number;
  subscribedAt: string;
}

function getSubscriberStorage(): RedisSessionStorage<Subscriber> | MemorySessionStorage<Subscriber> {
  const url = process.env.REDIS_URL;
  if (url) {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ioredis: any = require("ioredis");
    const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
    const client = new Redis(url, {
      maxRetriesPerRequest: null,
      lazyConnect: false,
    });
    return new RedisSessionStorage<Subscriber>(client as RedisLike, "sub:");
  }
  return new MemorySessionStorage<Subscriber>();
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
      const sub = await subscribers.read(key);
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
