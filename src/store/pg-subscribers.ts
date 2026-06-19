import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  pool = new Pool({ connectionString: url });
  return pool;
}

export async function ensureTable(): Promise<void> {
  const p = getPool();
  if (!p) return;
  await p.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      chat_id BIGINT PRIMARY KEY,
      username TEXT,
      subscribed_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}

export async function addSubscriber(
  chatId: number,
  username?: string,
): Promise<void> {
  const p = getPool();
  if (!p) return;
  await p.query(
    `INSERT INTO subscribers (chat_id, username)
     VALUES ($1, $2)
     ON CONFLICT (chat_id) DO NOTHING`,
    [chatId, username ?? null],
  );
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  const result = await p.query(
    `DELETE FROM subscribers WHERE chat_id = $1 RETURNING chat_id`,
    [chatId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function isSubscriber(chatId: number): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  const result = await p.query(
    `SELECT 1 FROM subscribers WHERE chat_id = $1`,
    [chatId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getAllChatIds(): Promise<number[]> {
  const p = getPool();
  if (!p) return [];
  const result = await p.query<{ chat_id: number }>(
    `SELECT chat_id FROM subscribers`,
  );
  return result.rows.map((row) => row.chat_id);
}
