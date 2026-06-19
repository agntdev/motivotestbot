import { createRequire } from "node:module";
import { Composer } from "grammy";
import {
  MemorySessionStorage,
  RedisSessionStorage,
} from "../toolkit/index.js";
import type { RedisLike } from "../toolkit/index.js";

type SubStore = MemorySessionStorage<unknown> | RedisSessionStorage<unknown>;

let _store: SubStore | null = null;

export function getSubscriberStorage(): SubStore {
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
    _store = new RedisSessionStorage<unknown>(client as RedisLike, "sub:");
  } else {
    _store = new MemorySessionStorage<unknown>();
  }
  return _store;
}

const composer = new Composer();

export default composer;
