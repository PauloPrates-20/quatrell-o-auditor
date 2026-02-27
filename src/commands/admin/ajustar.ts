/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';
import { Character, Player, Sanitizer } from '../../lib/classes';

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
    await interaction.deferReply({ flags: 'Ephemeral' });

    const target = interaction.options.getUser('jogador')!.id;
    const author = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();
    let player;
    const amount = (
      interaction.options.getInteger('ouro') ?? 
      interaction.options.getInteger('gemas') ?? 
      interaction.options.getInteger('xp')
    )!;
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
    const xpChannel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

    try {
      player = await loadPlayer(target);
    } catch (e: any) {
      console.error(e);
      await interaction.editReply(e.message);
      return;
    }

    if (subcommand === 'ouro') {
      try {
        player.setGold(amount);
        
        await updatePlayer(player);
        await interaction.editReply('Ajuste realizado com sucesso.');
        bankChannel.send(`Ouro de <@${target}> ajustado para ${amount} PO por <@${author}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao realizar ajuste: ${error}`);
      }
    } else if (subcommand === 'gema') {
      const gemType = interaction.options.getString('tipo')!;
      
      try {
        player.setGems(gemType, amount);
        await updatePlayer(player);
        await interaction.editReply('Ajuste realizado com sucesso.');
        treasureChannel.send(`Gemas ${GemTypes[gemType as keyof Gems]} de <@${target}> ajustadas para ${amount} por <@${author}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao realizar ajuste: ${error}`);
      }
    } else if (subcommand === 'xp') {
      const name = interaction.options.getString('personagem')!;
      
      try {
        const character = new Character(player.getCharacter(name));
        character.setXp(amount);
        player.updateCharacter(name, character);
        
        await updatePlayer(player);
        await interaction.editReply('Ajuste realizado com sucesso.');
        xpChannel.send(`XP do personagem ${character.name} de <@${target}> ajustado para ${amount} XP por <@${author}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao realizar ajuste: ${error}`);
      }
    }
  },
};