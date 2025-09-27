import type { Client } from "discord.js";
import { Whitelist } from "../api/whitelist";

export const name = "ready";
export const once = true;

export function execute(client: Client) {
  if (!client.user) return;
  console.log(`[APP]: Logado como ${client.user.tag}`);

  Whitelist(client, 3000);
}
