/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';
import { transferGold } from '../../lib/controllers/bank';
import { transferGem } from '../../lib/controllers/treasure';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transferir')
    .setDescription('Transfere ouro ou gemas para outro jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Transfere ouro para outro jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador que vai receber a transferência.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro para transferir')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Transfere gemas para outro jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador que vai receber a transferência.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a transferir.')
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
            .setDescription('Quantidade de gemas a transferir')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const target = interaction.options.getUser('jogador')!.id;
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!;

    if (author === target) {
      await interaction.editReply('Não é possível transferir para si mesmo.');
      return;
    }

    const transferencyChannel = interaction.client.channels.cache.get(channels.transferencies!) as TextChannel;
    const [authorPlayer, targetPlayer] = await Promise.all([loadPlayer(author), loadPlayer(target)]);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

      try {
        await transferGold(authorPlayer, targetPlayer, amount, transferencyChannel, bankChannel)
        await interaction.editReply(`${amount} PO transferidos para <@${target}>.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao transferir ouro: ${e}`)
        await interaction.editReply(`Falha ao realizar transferência: ${e.message}`);
      }
    } else if (subcommand === 'gema') {
      const type = interaction.options.getString('tipo') as keyof Gems;
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;

      try {
        await transferGem(authorPlayer, targetPlayer, type, amount, transferencyChannel, treasureChannel);
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[type]} transferidas para <@${target}>.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao transferir gemas: ${e}`);
        await interaction.editReply(`Falha ao realizar transferência: ${e.message}`);
      }
    }
  },
};