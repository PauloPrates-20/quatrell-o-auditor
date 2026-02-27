/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember, BaseGuildTextChannel, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';

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
    await interaction.deferReply({ flags: 'Ephemeral' });

    const target = interaction.options.getUser('jogador')!.id;
    const subcommand = interaction.options.getSubcommand();
    const source = 'Recompensa por doação ao servidor.';
    let player;
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;

    try {
      player = await loadPlayer(target);
    } catch(e: any) {
      await interaction.reply(e.message);
      return;
    }

    if (subcommand === 'ouro') {
      player.addGold(amount);

      const log = new Log('ouro', target, bankChannel.id, goldLogBuilder(player, 'deposita', amount, source));

      try {
        await Promise.all([updatePlayer(player), registerLog(log, target)]);
        bankChannel.send(log.content);
        await interaction.editReply(`${amount} PO depositados para <@${target}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar recompensas: ${error}`);
      }
    } else if (subcommand === 'gema') {
      const gemType = interaction.options.getString('tipo')!;

      
      try {
        player.addGems(gemType, amount);
  
        const log = new Log('gema', target, treasureChannel.id, gemLogBuilder(player, gemType as keyof Gems, amount, 'deposita', source));
        await Promise.all([updatePlayer(player), registerLog(log, target)]);
        treasureChannel.send(log.content);
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[gemType as keyof Gems]} depositadas para <@${target}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar recompensas: ${error}`);
      }
    }
  },
};