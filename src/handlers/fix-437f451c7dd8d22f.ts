import { Composer } from "grammy";
import { removeSubscriber } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("unsubscribe", async (ctx) => {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  if (chatId == null || userId == null) {
    await ctx.reply("Could not identify you. Please try again.");
    return;
  }

  const removed = await removeSubscriber(chatId, userId);
  if (removed) {
    await ctx.reply("You have been unsubscribed.");
  } else {
    await ctx.reply("You are not subscribed.");
  }
});

export default composer;