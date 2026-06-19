import { createRequire } from "node:module";
import type { StorageAdapter } from "grammy";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

let _store: StorageAdapter<string> | undefined;

function getSubStore(): StorageAdapter<string> {
  if (_store) return _store;
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
    _store = new RedisSessionStorage<string>(client, "sub:");
  } else {
    _store = new MemorySessionStorage<string>();
  }
  return _store;
}

const store = getSubStore();

export function getSharedStore(): StorageAdapter<string> {
  return store;
}

export async function addSubscriber(chatId: number): Promise<void> {
  const key = String(chatId);
  const existing = await store.read(key);
  if (existing != null) return;
  await store.write(key, new Date().toISOString());
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const key = String(chatId);
  const exists = await store.read(key);
  if (exists == null) return false;
  await store.delete(key);
  return true;
}

export async function isSubscriber(chatId: number): Promise<boolean> {
  const key = String(chatId);
  return (await store.read(key)) != null;
}

export async function getAllChatIds(): Promise<number[]> {
  const keysIter = store.readAllKeys?.();
  if (!keysIter) return [];
  const keys: string[] = [];
  for await (const key of keysIter) {
    keys.push(key);
  }
  return keys.map((key) => Number(key)).filter((n) => !isNaN(n));
}
