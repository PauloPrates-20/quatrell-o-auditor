/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { CharacterDef } from '../../lib/definitions';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listar')
        .setDescription('Exibe uma lista de seus personagens cadastrados.'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user.id;
        let player;

        try {
            player = await loadPlayer(author);
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        const characters = player.characters;

        if (Object.keys(characters).length === 0) {
            await interaction.editReply('Nenhum personagem cadastrado. Utilize o comando `/personagem` para começar a cadastrar seus personagens.');
            return;
        }

        let text = '';
        for (const char of characters) {
            text += `Nome: ${char.name}\nXP: ${char.xp}\nNível: ${char.level}\nTier: ${char.tier}\n\n`;
        }

        await interaction.editReply(`Lista de personagens:\n\n${text}`);
    },
};