/* Imports */
import { GuildMember, BaseGuildTextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder } from '../../lib/messages';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
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

    let channel;
    const author = (interaction.member as GuildMember)!.id;
    const source = interaction.options.getString('origem')!;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(author);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    if (!sourceValidation(source!)) {
      await interaction.editReply('Origem inválida.');
      return;
    }

    if (!player) {
      await interaction.editReply('Jogador não encontrado. Utilize /registrar para se cadastrar.');
      return;
    }

    if (subcommand === 'ouro') {
      channel = channels.bank!;
      const clientChannel = interaction.client.channels.cache.get(channel) as BaseGuildTextChannel;
      player.addGold(amount);

      const goldLog = new Log('ouro', author, channel!, goldLogBuilder(player, 'deposita', amount, source!));

      try {
        await updatePlayer(player);
        await registerLog(goldLog, author);
        clientChannel.send(goldLog.content);
        await interaction.editReply(`${amount} PO adicionados com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar ouro: ${error}`);
      }
    } else if (subcommand === 'gema') {
      channel = channels.treasure!;
      const clientChannel = interaction.client.channels.cache.get(channel) as BaseGuildTextChannel;
      const type = interaction.options.getString('tipo');

      player.addGems(type as keyof Gems, amount);

      const gemLog = new Log('gema', author, channel!, gemLogBuilder(player, type as keyof Gems, amount, 'deposita', source!));

      try {
        await updatePlayer(player);
        await registerLog(gemLog, author);
        clientChannel.send(gemLog.content);
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[type as keyof Gems]} adicionada(s) com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar gemas: ${error}`);
      }
    }
  },
};