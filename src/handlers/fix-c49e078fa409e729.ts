import { Composer } from "grammy";
import { isSubscriber } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("subcheck", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId == null) {
    await ctx.reply("Could not identify chat. Please try again.");
    return;
  }
  const subscribed = await isSubscriber(chatId);
  if (subscribed) {
    await ctx.reply("You are currently subscribed.");
  } else {
    await ctx.reply("You are not subscribed.");
  }
});

export default composer;
