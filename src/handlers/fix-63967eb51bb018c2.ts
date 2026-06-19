import { Composer } from "grammy";
import { addSubscriber, isSubscriber } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("subscribe", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId == null) {
    await ctx.reply("Could not identify chat. Please try again.");
    return;
  }
  const already = await isSubscriber(chatId);
  if (already) {
    await ctx.reply("You're already subscribed.");
    return;
  }
  await addSubscriber(chatId);
  await ctx.reply(
    "Subscribed — you'll receive one motivational quote every morning at 09:00 UTC.",
  );
});

export default composer;
