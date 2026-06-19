import { createRequire } from "node:module";

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
}

const PREFIX = "sub:";

function k(chatId: number, userId: number): string {
  return PREFIX + String(chatId) + ":" + String(userId);
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

export async function removeSubscriber(chatId: number, userId: number): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const key = k(chatId, userId);
  const exists = await client.get(key);
  if (!exists) return false;
  await client.del(key);
  return true;
}

export async function isSubscriber(chatId: number, userId: number): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const key = k(chatId, userId);
  return (await client.get(key)) !== null;
}