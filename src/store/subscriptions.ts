import { createRequire } from "node:module";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

type SubStore = MemorySessionStorage<string> | RedisSessionStorage<string>;

let _store: SubStore | null = null;

function getStore(): SubStore {
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
    _store = new RedisSessionStorage<string>(client as RedisLike, "sub:");
  } else {
    _store = new MemorySessionStorage<string>();
  }
  return _store;
}

async function resolveKeys(
  keys: string[] | AsyncIterableIterator<string>,
): Promise<string[]> {
  if (Array.isArray(keys)) return keys;
  const result: string[] = [];
  for await (const k of keys) result.push(k);
  return result;
}

export async function addSubscriber(chatId: number): Promise<void> {
  const key = String(chatId);
  await getStore().write(key, new Date().toISOString());
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const store = getStore();
  const chatPrefix = `${chatId}`;
  const allKeys = await resolveKeys(store.readAllKeys());
  const matching = allKeys.filter(
    (k) => k === chatPrefix || k.startsWith(`${chatPrefix}:`),
  );
  if (matching.length === 0) return false;
  for (const k of matching) {
    await store.delete(k);
  }
  return true;
}

export async function getAllChatIds(): Promise<number[]> {
  const store = getStore();
  const allKeys = await resolveKeys(store.readAllKeys());
  const ids = new Set<number>();
  for (const k of allKeys) {
    const colon = k.indexOf(":");
    const chatPart = colon < 0 ? k : k.slice(0, colon);
    const n = Number(chatPart);
    if (!isNaN(n)) ids.add(n);
  }
  return [...ids];
}

export async function isSubscriber(chatId: number): Promise<boolean> {
  const store = getStore();
  const chatPrefix = `${chatId}`;
  const allKeys = await resolveKeys(store.readAllKeys());
  return allKeys.some(
    (k) => k === chatPrefix || k.startsWith(`${chatPrefix}:`),
  );
}
