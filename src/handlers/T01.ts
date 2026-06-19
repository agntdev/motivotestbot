import { Composer } from "grammy";

const composer = new Composer();

composer.command("status", async (ctx) => {
  await ctx.reply("OK");
});

export default composer;
