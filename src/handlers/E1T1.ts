import { Composer } from "grammy";
import { getSubscriberStorage } from "./fix-631f6847412d06b0.js";

interface Subscriber {
  userId: number;
  chatId: number;
  subscribedAt: string;
}

const subscribers = getSubscriberStorage();

const composer = new Composer();

composer.command("subscribe", async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (userId == null || chatId == null) {
    await ctx.reply("Could not identify you. Please try again.");
    return;
  }
  const key = `${chatId}:${userId}`;
  const record: Subscriber = {
    userId,
    chatId,
    subscribedAt: new Date().toISOString(),
  };
  await subscribers.write(key, record);
  await ctx.reply("You have been subscribed successfully!");
});

export default composer;