import { createRequire } from "node:module";
import { Composer } from "grammy";
import type { StorageAdapter } from "grammy";
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

function getSubscriberStorage(): StorageAdapter<Subscriber> {
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

const composer = new Composer();

composer.command("unsubscribe", async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (userId == null || chatId == null) {
    await ctx.reply("Could not identify you. Please try again.");
    return;
  }
  const key = `${chatId}:${userId}`;
  const record = await subscribers.read(key);
  if (record == null) {
    await ctx.reply("You are not subscribed.");
    return;
  }
  await subscribers.delete(key);
  await ctx.reply("You have been unsubscribed.");
});

export default composer;