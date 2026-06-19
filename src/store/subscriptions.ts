import { createRequire } from "node:module";
import type { StorageAdapter } from "grammy";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

function getSubStore(): StorageAdapter<string> {
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
    return new RedisSessionStorage<string>(client, "sub:");
  }
  return new MemorySessionStorage<string>();
}

const store = getSubStore();

export async function addSubscriber(chatId: number): Promise<void> {
  const key = String(chatId);
  await store.write(key, new Date().toISOString());
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const key = String(chatId);
  const exists = await store.read(key);
  if (exists == null) return false;
  await store.delete(key);
  return true;
}

export async function addSubscriber(chatId: number): Promise<void> {
  const client = getClient();
  if (!client) return;
  const key = k(chatId);
  await client.set(key, "1");
}

export async function getAllChatIds(): Promise<number[]> {
  const client = getClient();
  if (!client) return [];
  const keys = await client.keys(PREFIX + "*");
  return keys.map((key) => Number(key.slice(PREFIX.length))).filter((n) => !isNaN(n));
}

export async function isSubscriber(chatId: number): Promise<boolean> {
  const key = String(chatId);
  return (await store.read(key)) !== null;
}
