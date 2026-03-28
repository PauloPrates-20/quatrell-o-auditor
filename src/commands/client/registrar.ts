/* Imports */
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { registerPlayer } from '../../lib/firebase/firestoreQuerys';
import { Player } from '../../lib/classes';
import { getPlayer } from '../../lib/listCache';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registrar')
        .setDescription('Registra o jogador no banco de dados do servidor.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const author = interaction.user.id;
        await interaction.deferReply({ flags: 'Ephemeral' });
        let player;

        try {
            player = getPlayer(author);
        } catch (e) { }

        if (player) {
            await interaction.editReply('Jogador já cadastrado!');
            return;
        }

        player = new Player({ id: author });

        try {
            await registerPlayer(player);

            await interaction.editReply('Jogador cadastrado com sucesso!');
        } catch (e: any) {
            await interaction.editReply('Falha ao cadastrar jogador: ' + e.message);
        }
    },
};