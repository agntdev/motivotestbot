import { Composer } from "grammy";

const composer = new Composer();

composer.callbackQuery("menu:status", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("OK");
});

composer.callbackQuery("menu:help", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "Available commands:\n" +
    "/start — Welcome message\n" +
    "/status — Check bot status\n" +
    "/help — Show this help",
  );
});

export default composer;
