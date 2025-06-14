/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { playerValidation } from '../../lib/validation';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listar')
		.setDescription('Exibe uma lista de seus personagens cadastrados.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
    
    const author = interaction.user.id;
		const player = await loadPlayer(author);

    let validation = playerValidation(player);
		if (typeof validation === 'string') {
			await interaction.editReply(validation);
			return;
		}

		if (player!.characters.length === 0) {
			await interaction.editReply('Nenhum personagem cadastrado. Utilize o comando `/personagem` para começar a cadastrar seus personagens.');
			return;
		}

		let text = '';
		for (const character of player!.characters) text += `Nome: ${character.name}\nXP: ${character.xp}\nNível: ${character.level}\nTier: ${character.tier}\n\n`;

		await interaction.editReply(`Lista de personagens:\n\n${text}`);
	},
};