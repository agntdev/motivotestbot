import { Composer } from "grammy";

const composer = new Composer();

composer.command("start", async (ctx) => {
  await ctx.reply("Welcome! I am ready to help.");
});

export default composer;
