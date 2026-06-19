import { Composer } from "grammy";

const composer = new Composer();

composer.command("help", async (ctx) => {
  await ctx.reply(
    "Available commands:\n" +
    "/start — Welcome message\n" +
    "/status — Check bot status\n" +
    "/help — Show this help",
  );
});

export default composer;
