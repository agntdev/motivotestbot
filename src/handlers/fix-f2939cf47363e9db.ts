import { randomInt } from "node:crypto";
import { Composer } from "grammy";
import { QUOTES } from "../quotes.js";

function pickQuote(): string {
  return QUOTES[randomInt(QUOTES.length)];
}

const composer = new Composer();

composer.command("dailyquote", async (ctx) => {
  const quote = pickQuote();
  await ctx.reply(`📜 Daily Quote:\n\n${quote}`);
});

export default composer;