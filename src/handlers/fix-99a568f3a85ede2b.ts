import { Composer } from "grammy";
import { ensureTable } from "../store/pg-subscribers.js";

if (process.env.DATABASE_URL) {
  ensureTable().catch((err: unknown) => {
    console.error(
      "[agntdev-bot] failed to initialize Postgres subscribers table:",
      err,
    );
  });
}

const composer = new Composer();

export default composer;
