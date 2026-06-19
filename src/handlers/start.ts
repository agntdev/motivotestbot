import { Composer } from "grammy";
import { inlineKeyboard, inlineButton } from "../toolkit/index.js";

const composer = new Composer();

composer.command("start", async (ctx) => {
  await ctx.reply("Welcome! I am AGNTDEV Bot. Choose an option:", {
    reply_markup: inlineKeyboard([
      [inlineButton("Status", "menu:status")],
      [inlineButton("Help", "menu:help")],
    ]),
  });
});

export default composer;
