/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { Sanitizer } from '../../lib/classes';
import { setGold } from '../../lib/controllers/bank';
import { setGem } from '../../lib/controllers/treasure';
import { setXp } from '../../lib/controllers/xp';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajustar')
    .setDescription('Ajusta os valores de ouro, gemas ou XP de um jogador.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Ajusta o valor de ouro do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro do jogador após o ajuste.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Ajusta a quantidade de gemas do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a ajustar.')
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
            .setDescription('Quantidade de gemas do jogador após o ajuste.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('xp')
        .setDescription('Ajusta o valor de XP de um personagem do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem a editar.')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Quantidade de XP do personagem após o ajuste.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('jogador')!.id;
    const author = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(target);
    const amount = (
      interaction.options.getInteger('ouro') ??
      interaction.options.getInteger('gemas') ??
      interaction.options.getInteger('xp')
    )!;

    if (!player) {
      await interaction.editReply('Jogador não encontrado.');
      return;
    }

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank) as TextChannel;

      if (amount < 0) {
        await interaction.editReply('Valor não pode ser menor que 0.');
        return;
      }

      player.gold = amount;

      try {
        await setGold(author, player, amount, bankChannel);
        await interaction.editReply('Ajuste realizado com sucesso.');
      } catch (e: any) {
        console.error(`[ERROR] Falha ao ajustar ouro do jogador: ${e}`)
        await interaction.editReply(`Falha ao realizar ajuste: ${e.message}`);
      }
    } else if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure) as TextChannel;
      const type = interaction.options.getString('tipo') as keyof Gems;

      try {
        await setGem(author, player, type, amount, treasureChannel);
        await interaction.editReply('Ajuste realizado com sucesso.');
      } catch (e: any) {
        console.error(`[ERROR] Falha ao ajustar gemas: ${e}`)
        await interaction.editReply(`Falha ao realizar ajuste: ${e.message}`);
      }
    } else if (subcommand === 'xp') {
      const xpChannel = interaction.client.channels.cache.get(channels.xp) as TextChannel;
      const name = interaction.options.getString('personagem')!;

      const character = player.getCharacter(name);

      try {
        await setXp(author, player, character, amount, xpChannel);
        await interaction.editReply('Ajuste realizado com sucesso.');
      } catch (e: any) {
        console.error(`[ERROR]: Falha ao ajustar xp: ${e}`);
        await interaction.editReply(`Falha ao realizar ajuste: ${e.message}`);
      }
    }
  },
};