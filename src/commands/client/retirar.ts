/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';
import { withdrawGold } from '../../lib/controllers/bank';
import { withdrawGem } from '../../lib/controllers/treasure';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('retirar')
    .setDescription('Retira ouro ou gemas do jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Retira ouro do jogador.')
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro a retirar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica o gasto.')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('retira gemas do jogador.')
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a ser retirada.')
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
            .setDescription('Quantidade de gemas a retirar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a retirada das gemas.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const source = interaction.options.getString('origem')!;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(author);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

      try {
        await withdrawGold(player, amount, source, bankChannel);
        await interaction.editReply(`${amount} PO retirados com sucesso.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao retirar ouro: ${e}`);
        await interaction.editReply(`Falha ao retirar ouro: ${e.message}`);
      }
    } else if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel
      const type = interaction.options.getString('tipo') as keyof Gems;

      try {
        await withdrawGem(player, type, amount, source, treasureChannel);
        await interaction.editReply(`${amount}x Gema ${GemTypes[type]} retirada(s) com sucesso.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao retirar gemas: ${e}`)
        await interaction.editReply(`Falha ao retirar gemas: ${e.message}`);
      }
    }
  },
};