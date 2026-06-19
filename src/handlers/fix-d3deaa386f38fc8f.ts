import { Composer } from "grammy";
import { subscribers } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("unsubscribe", async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  if (userId == null || chatId == null) {
    await ctx.reply("Could not identify you. Please try again.");
    return;
  }
  const key = `${chatId}:${userId}`;
  const exists = (await subscribers.read(key)) !== undefined;
  if (!exists) {
    await ctx.reply("You are not subscribed.");
    return;
  }
  await subscribers.delete(key);
  await ctx.reply("You have been unsubscribed.");
});

export default composer;
