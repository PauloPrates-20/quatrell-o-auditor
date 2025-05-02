/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { Validator } from '../../lib/controllers/validator';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listar')
		.setDescription('Exibe uma lista de seus personagens cadastrados.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
    
    const author = interaction.user.id;
		const player = await loadPlayer(author);

		const valid = Validator.inputs([{ type: 'player', value: player }], interaction);

    if (!valid) return;

		const characters = player!.characters;

		if (characters.length === 0) {
			await interaction.editReply('Nenhum personagem cadastrado. Utilize o comando `/personagem` para começar a cadastrar seus personagens.');
			return;
		}

		let text = '';
		characters.forEach(character => {
			text += `Nome: ${character.name}\nXP: ${character.xp}\nNível: ${character.level}\nTier: ${character.tier}\n\n`;
    });

		await interaction.editReply(`Lista de personagens:\n\n${text}`);
	},
};