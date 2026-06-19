import { Composer } from "grammy";
import { removeSubscriber } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("unsubscribe", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const removed = await removeSubscriber(chatId);
  if (removed) {
    await ctx.reply("You have been unsubscribed.");
  } else {
    await ctx.reply("You are not subscribed.");
  }
});

export default composer;