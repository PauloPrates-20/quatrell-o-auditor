/* Imports */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadPlayer, deletePlayer } = require('../../lib/firebase/firestoreQuerys');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remover')
		.setDescription('Remove um jogador cadastrado do servidor')
		.addUserOption(option =>
			option.setName('jogador')
				.setDescription('O jogador a ser removido')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const target = interaction.options.getMember('jogador');
		const player = await loadPlayer(target.id);

		if (!player) {
			await interaction.editReply('Jogador não encontrado.');
			return;
		}

		try {
			deletePlayer(target.id);
			await interaction.editReply(`Jogador <@${target.id}> deletado.`);
		} catch (error) {
			await interaction.editReply(`Falha ao deletar jogador: ${error}`);
		}
	},
};