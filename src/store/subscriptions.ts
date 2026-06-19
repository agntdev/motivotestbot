import { createRequire } from "node:module";

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
}

const PREFIX = "sub:";

function k(chatId: number): string {
  return PREFIX + String(chatId);
}

let _client: RedisLike | null | undefined;

function getClient(): RedisLike | null {
  if (_client !== undefined) return _client;
  const url = process.env.REDIS_URL;
  if (!url) {
    _client = null;
    return null;
  }
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ioredis: any = require("ioredis");
    const Redis = ioredis.default ?? ioredis.Redis ?? ioredis;
    _client = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false }) as RedisLike;
  } catch {
    _client = null;
  }
  return _client;
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const key = k(chatId);
  const exists = await client.get(key);
  if (!exists) return false;
  await client.del(key);
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
  const client = getClient();
  if (!client) return false;
  const key = k(chatId);
  return (await client.get(key)) !== null;
}