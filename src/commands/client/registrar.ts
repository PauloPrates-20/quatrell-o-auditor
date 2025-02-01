/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, registerPlayer } from '../../lib/firebase/firestoreQuerys';
import { Player } from '../../lib/classes';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('registrar')
		.setDescription('Registra o jogador no banco de dados do servidor.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		let player = await loadPlayer((interaction.member as GuildMember).id);

		if (player) {
			await interaction.editReply('Jogador já cadastrado!');
			return;
		}

		player = new Player((interaction.member as GuildMember).id);

		try {
			await registerPlayer(player);

			await interaction.editReply('Jogador cadastrado com sucesso!');
			return;
		} catch (error) {
			await interaction.editReply('Falha ao cadastrar jogador: ' + error);
		}
	},
};