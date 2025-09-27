import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import path from "path";
import fs from "fs";

config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

interface CLientWithCommands extends Client {
  commands: Collection<string, any>;
}
(client as CLientWithCommands).commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      (client as CLientWithCommands).commands.set(command.data.name, command);
    } else {
      console.log(`[APP]: Comando faltando propriedades: ${filePath}`);
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".ts"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
