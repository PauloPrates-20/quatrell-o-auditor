/* Imports */
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, registerPlayer } from '../../lib/firebase/firestoreQuerys';
import { Player } from '../../lib/classes';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('registrar')
		.setDescription('Registra o jogador no banco de dados do servidor.'),
	async execute(interaction: ChatInputCommandInteraction) {
    const author = interaction.user.id;
		await interaction.deferReply({ flags: 'Ephemeral' });
		let player = await loadPlayer(author);

		if (player) {
			await interaction.editReply('Jogador já cadastrado!');
			return;
		}

		player = new Player(author);

		try {
			await registerPlayer(player);

			await interaction.editReply('Jogador cadastrado com sucesso!');
			return;
		} catch (error) {
			await interaction.editReply('Falha ao cadastrar jogador: ' + error);
		}
	},
};