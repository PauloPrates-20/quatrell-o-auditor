/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { loadPlayer, deletePlayer } from '../../lib/firebase/firestoreQuerys';
import { Validator } from '../../lib/controllers/validator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remover')
    .setDescription('Remove um jogador cadastrado do servidor')
    .addUserOption(option =>
      option
        .setName('jogador')
        .setDescription('O jogador a ser removido')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser('jogador')!.id;
    const player = await loadPlayer(target);

    const valid = await Validator.inputs([{ type: 'player', value: player }], interaction);

    if (!valid) return;

    try {
      deletePlayer(target);
      await interaction.editReply(`Jogador <@${target}> deletado.`);
    } catch (error) {
      await interaction.editReply(`Falha ao deletar jogador: ${error}`);
    }
  },
};