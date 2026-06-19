import { createRequire } from "node:module";
import type { StorageAdapter } from "grammy";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

function getSubStore(): RedisSessionStorage<string> | MemorySessionStorage<string> {
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
    return new RedisSessionStorage<string>(client as RedisLike, "sub:");
  }
  return new MemorySessionStorage<string>();
}

const store: RedisSessionStorage<string> | MemorySessionStorage<string> = getSubStore();

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

export async function getAllChatIds(): Promise<number[]> {
  const ids: number[] = [];
  for await (const key of store.readAllKeys()) {
    const id = Number(key);
    if (!isNaN(id)) ids.push(id);
  }
  return ids;
}

export async function isSubscriber(chatId: number): Promise<boolean> {
  const key = String(chatId);
  return (await store.read(key)) !== null;
}