import {
  Client,
  Collection,
  Interaction,
  Events,
  TextInputStyle,
  MessageFlags,
} from "discord.js";

interface ClientWithCommands extends Client {
  commands: Collection<string, any>;
}

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    const client = interaction.client as ClientWithCommands;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          {
            type: 17,
            accent_color: 0x242429,
            components: [
              { type: 10, content: "Deu bigode [command_name]..." },
              { type: 14, divider: true },
            ],
          },
        ],
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      const payload = {
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          {
            type: 17,
            accent_color: 0x242429,
            components: [
              { type: 10, content: "Deu bigode [command]..." },
              { type: 14, divider: true },
            ],
          },
        ],
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId === "start_whitelist") {
      await interaction.showModal({
        customId: "whitelist_modal",
        title: "Sistema de Whitelist",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                customId: "nome",
                label: "Nome",
                style: TextInputStyle.Short,
                placeholder: "Digite seu nome",
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                customId: "sobrenome",
                label: "Sobrenome",
                style: TextInputStyle.Short,
                placeholder: "Digite seu sobrenome",
                required: true,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                customId: "token",
                label: "Token",
                style: TextInputStyle.Short,
                placeholder: "Digite seu token de 6 dígitos",
                required: true,
              },
            ],
          },
        ],
      });
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId !== "whitelist_modal") return;

    const nome = interaction.fields.getTextInputValue("nome");
    const sobrenome = interaction.fields.getTextInputValue("sobrenome");
    const tokenRaw = interaction.fields.getTextInputValue("token");
    const token = tokenRaw.replace(/^#/, "").trim();

    try {
      const response = await fetch("http://localhost:3000/approve-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [
            {
              type: 17,
              accent_color: 0x242429,
              components: [
                { type: 10, content: `Whitelist aprovada!\n${nome} ${sobrenome}` },
                { type: 14, divider: true },
              ],
            },
          ],
        });
      } else {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [
            {
              type: 17,
              accent_color: 0x242429,
              components: [
                { type: 10, content: `${result.error || result.message}` },
                { type: 14, divider: true },
              ],
            },
          ],
        });
      }
    } catch (err) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          {
            type: 17,
            accent_color: 0x242429,
            components: [
              { type: 10, content: "Deu bigode..." },
              { type: 14, divider: true },
            ],
          },
        ],
      });
    }
  }
}
