/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, BaseGuildTextChannel } from 'discord.js';
import { loadPlayer, deletePlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bane um jogador do servidor e apaga seus dados.')
		.addUserOption(option => option.setName('jogador').setDescription('Jogador a banir').setRequired(true))
		.addStringOption(option => option.setName('motivo').setDescription('Motivo do banimento.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const target = interaction.options.getUser('jogador')!.id;
		const reason = interaction.options.getString('motivo') ? interaction.options.getString('motivo') : 'Motivo não especificado.';

		if (target === interaction.user.id) {
			await interaction.editReply('Não é possível banir a si mesmo.');
			return;
		}

		const player = await loadPlayer(target);
		let deleted = false;

		if (player) {
			try {
				await deletePlayer(target);
				deleted = true;
			} catch (error) {
				await interaction.editReply(`Falha do deletar dados do jgoador: ${error}`);
			}
		}

		interaction.guild!.members.ban(target, { reason: reason! });
		await interaction.editReply(`Usuário <@${target}> banido. ${deleted ? 'Dados do jogador deletados.' : 'Sem dados do jogador para deletar.'}`);
		(interaction.client.channels.cache.get(channels.general!) as BaseGuildTextChannel).send(`Usuário <@${target}> banido por: ${reason}`);
	},
};