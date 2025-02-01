/* Imports */
const { SlashCommandBuilder } = require('discord.js');
const { loadPlayer, registerPlayer } = require('../../lib/firebase/firestoreQuerys');
const { Player } = require('../../lib/classes');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('registrar')
		.setDescription('Registra o jogador no banco de dados do servidor.'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		let player = await loadPlayer(interaction.member.id);

		if (player) {
			await interaction.editReply('Jogador já cadastrado!');
			return;
		}

		player = new Player(interaction.member.id);

		try {
			await registerPlayer(player);

			await interaction.editReply('Jogador cadastrado com sucesso!');
			return;
		} catch (error) {
			await interaction.editReply('Falha ao cadastrar jogador: ' + error);
		}
	},
};