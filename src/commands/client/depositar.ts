/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { depositGold } from '../../lib/controllers/bank';
import { depositGem } from '../../lib/controllers/treasure';
import { GemTypes } from '../../lib/tables';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('depositar')
    .setDescription('Deposita ouro ou gemas para o jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Deposita ouro para o jogador.')
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro a depositar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a origem do ouro.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Deposita gemas para o jogador.')
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a ser adicionada.')
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
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a origem das gemas.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user!.id;
    const source = interaction.options.getString('origem')!;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(author);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank) as TextChannel;

      try {
        await depositGold(player, amount, source, bankChannel);
        await interaction.editReply(`${amount} PO depositado(s) com sucesso!`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao depositar ouro: ${e}`);
        await interaction.editReply(`Falha ao depositar ouro: ${e.message}`);
      }
    } else if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure) as TextChannel;
      const type = interaction.options.getString('tipo') as keyof Gems;

      try {
        await depositGem(player, type, amount, source, treasureChannel);
        await interaction.editReply(`${amount}x ${GemTypes[type]} depositada(s) com sucesso!`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao depositar gemas: ${e}`);
        await interaction.editReply(`Falha ao depositar gemas: ${e.message}`);
      }
    }
  },
};