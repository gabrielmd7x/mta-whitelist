import {
  SlashCommandBuilder,
  type CommandInteraction,
  type TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("message_whitelist")
  .setDescription("Envie a mensagem de whitelist.")

export async function execute(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand() || !interaction.guild) return;
  try {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel as TextChannel;
    const message = await channel.send({
      flags: "IsComponentsV2",
      components: [
      {
        type: 17,
        accent_color: 0x242429,
        components: [
          {
            type: 10,
            content: "# Sistema de Whitelist | MTA:SA\nClique no botão abaixo para dar inicio ao processo de whitelist.",
          },
        {
          type: 12,
          items: [
            {
              media: {
                url: "https://portalvirtualreality.ru/wp-content/uploads/2018/10/Gta-San-Andreas-post.jpg",
              },
            },
          ],
        },
        {
          type: 10,
          content: "-# manowgabriel © MTA - 2025",
        },
        {
          type: 14,
          divider: true,
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              custom_id: "start_whitelist",
              label: "Start Whitelist",
            },
            {
              type: 2,
              style: 5,
              label: "Wiki",
              url: "https://wiki.multitheftauto.com/wiki/Main_Page",
            },
          ],
        },
        ],
      },
      ],
    });

    await interaction.editReply({
      flags: "IsComponentsV2",
      components: [
        {
          type: 17,
          accent_color: 0x242429,
          components: [
            {
              type: 10,
              content: "Mensagem enviada com sucesso.",
            },
            {
              type: 14,
              divider: true,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("[ERRO container]:", error);
    await interaction.editReply({
      flags: "IsComponentsV2",
      components: [
        {
          type: 17,
          accent_color: 0x242429,
          components: [
            {
              type: 10,
              content: "Algo de errado aconteceu ao enviar a mensagem.",
            },
            {
              type: 14,
              divider: true,
            },
          ],
        },
      ],
    });
  }
}
