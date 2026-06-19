import { getSubscriberStorage } from "../handlers/fix-631f6847412d06b0.js";

const store = getSubscriberStorage();

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
