import { createRequire } from "node:module";
import { Composer } from "grammy";
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

const composer = new Composer();

export default composer;
