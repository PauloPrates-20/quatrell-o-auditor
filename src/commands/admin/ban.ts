/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { loadPlayer, deletePlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um jogador do servidor e apaga seus dados.')
        .addUserOption(option =>
            option
                .setName('jogador')
                .setDescription('Jogador a banir')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo do banimento.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const generalChannel = interaction.client.channels.cache.get(channels.general!) as TextChannel;
        const target = interaction.options.getUser('jogador')!.id;
        const reason = interaction.options.getString('motivo') ?? 'Motivo não especificado.';

        if (target === interaction.user.id) {
            await interaction.editReply('Não é possível banir a si mesmo.');
            return;
        }

        let player = false;

        try {
            player = !!(await loadPlayer(target));
        } catch (e) { }

        let deleted = false;

        try {
            if(player) {
                await deletePlayer(target);
                deleted = true;
            }

            interaction.guild!.members.ban(target, { reason: reason! });
            await interaction.editReply(`Usuário <@${target}> banido. ${deleted ? 'Dados do jogador deletados.' : 'Sem dados do jogador para deletar.'}`);
            generalChannel.send(`Usuário <@${target}> banido por: ${reason}`);
        } catch (e: any) {
            await interaction.editReply(`Falha ao deletar dados do jogador: ${e.message}`);
        }
    },
};