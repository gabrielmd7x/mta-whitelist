import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { REST, Routes } from "discord.js";

config();

const commands: any[] = [];
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
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING]: O comando em ${filePath} está faltando a propriedade "data" ou "execute".`
      );
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(`[APP]: Iniciando com ${commands.length} comandos.`);
    const data: any = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      {
        body: commands,
      }
    );
    console.log(`[APP]: Iniciado com sucesso. (${data.length} comandos)`);
  } catch (error) {
    console.error(error);
  }
})();
