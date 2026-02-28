/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { loadPlayer, deletePlayer } from '../../lib/firebase/firestoreQuerys';

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
        await interaction.deferReply({ flags: 'Ephemeral' });
        const target = interaction.options.getUser('jogador')!.id;

        try {
            await loadPlayer(target);
            deletePlayer(target);
            await interaction.editReply(`Jogador <@${target}> deletado.`);
        } catch (e: any) {
            await interaction.editReply(`Falha ao deletar jogador: ${e.message}`);
        }
    },
};