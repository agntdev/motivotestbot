import { Composer } from "grammy";
import { getAllChatIds } from "../store/subscriptions.js";

const composer = new Composer();

composer.command("subcount", async (ctx) => {
  const chatIds = await getAllChatIds();
  await ctx.reply(`There are ${chatIds.length} subscriber(s).`);
});

export default composer;
