/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder } from '../../lib/messages';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';

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

    if (!sourceValidation(source)) {
      await interaction.editReply('Origem inválida.');
      return;
    }

    if (!player) {
      await interaction.editReply('Jogador não encontrado. Utilize `/registrar` para se cadastrar.');
      return;
    }

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

      if (player.gold < amount) {
        await interaction.editReply('Ouro insuficiente.');
        return;
      }
      if (amount < 0){
        await interaction.editReply('Valor de inválido.');
        return;
      }else {
        player.subGold(amount);
      }

      const goldLog = new Log('ouro', author.toString(), bankChannel.id, goldLogBuilder(player, 'retira', amount, source));

      try {
        await updatePlayer(player);
        await registerLog(goldLog, author);
        bankChannel.send(goldLog.content);
        await interaction.editReply(`${amount} PO retirados com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao retirar ouro: ${error}`);
      }
    } else if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel
      const type = interaction.options.getString('tipo') as keyof Gems;

      if (player.gems[type] < amount) {
        await interaction.editReply('Gemas insuficientes.');
        return;
      }

      player.subGems(type, amount);

      const gemLog = new Log('gema', author.toString(), treasureChannel.id, gemLogBuilder(player, type, amount, 'retira', source));

      try {
        await updatePlayer(player);
        await registerLog(gemLog, author);
        treasureChannel.send(gemLog.content);
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[type]} retirada(s) com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao retirar gemas: ${error}`);
      }
    }
  },
};