/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember, BaseGuildTextChannel, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';
import { depositGold } from '../../lib/controllers/bank';
import { depositGem } from '../../lib/controllers/treasure';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recompensar')
    .setDescription('Deposita recompensas de doações para os jogadores.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Deposita a recompensa em ouro das doações.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a receber a recompensa.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro a depositar.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Deposita a recompensa em gemas das doações.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a receber a recompensa.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a depositar.')
            .addChoices(
              { name: 'Comum', value: 'comum' },
              { name: 'Transmutação', value: 'transmutacao' },
              { name: 'Ressureição', value: 'ressureicao' },
            )
            .setRequired(true),
        )
        .addIntegerOption(option =>
          option
            .setName('gemas')
            .setDescription('Quantidade de gemas a depositar.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('jogador')!.id;
    const subcommand = interaction.options.getSubcommand();
    const source = 'Recompensa por doação ao servidor.';
    const player = await loadPlayer(target);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    if (!player) {
      await interaction.editReply('Jogador não encontrado.');
      return;
    }

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
      try {
        await depositGold(player, amount, source, bankChannel, true);
        await interaction.editReply(`${amount} PO depositados para <@${target}>.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao recompensar ouro: ${e}`);
        await interaction.editReply(`Falha ao depositar recompensas: ${e.message}`);
      }
    } else if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
      const type = interaction.options.getString('tipo') as keyof Gems;

      try {
        await depositGem(player, type, amount, source, treasureChannel, true);
        await interaction.editReply(`${amount}x Gema ${GemTypes[type]} depositada(s) para <@${target}>.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao recompensar gemas: ${e}`)
        await interaction.editReply(`Falha ao depositar recompensas: ${e.message}`);
      }
    }
  },
};