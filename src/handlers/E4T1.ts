import { Composer } from "grammy";
import { QUOTES } from "../quotes.js";

const composer = new Composer();

composer.command("quote", async (ctx) => {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  await ctx.reply(quote);
});

export default composer;