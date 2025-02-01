/* Imports */
import { BaseGuildTextChannel, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log } from '../../lib/classes';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { xpLogBuilder } from '../../lib/messages';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('personagem')
		.setDescription('Conjunto de comandos relacionados aos personagens do jogador.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('adicionar')
				.setDescription('Adiciona um novo personagem à lista de personagens do jogador.')
				.addStringOption(option => option.setName('personagem').setDescription('Nome do personagem').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remover')
				.setDescription('Remove o personagem escolhido da lista de personagens do jogador.')
				.addStringOption(option => option.setName('personagem').setDescription('Nome do personagem').setRequired(true).setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('renomear')
				.setDescription('Renomeia um personagem, mantendo seus atributos.')
				.addStringOption(option => option.setName('personagem').setDescription('Personagem a ser renomeado.').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('nome').setDescription('Novo nome.').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-xp')
				.setDescription('Adiciona XP ao personagem escolhido.')
				.addIntegerOption(option => option.setName('xp').setDescription('Quantidade de XP a adicionar').setRequired(true))
				.addStringOption(option => option.setName('personagem').setDescription('Nome do personagem').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica o ganho de XP.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('sub-xp')
				.setDescription('Subtrai xp do personagem selecionado.')
				.addIntegerOption(option => option.setName('xp').setDescription('Quantidade de xp a subtrair').setRequired(true))
				.addStringOption(option => option.setName('personagem').setDescription('Nome do personagem').setRequired(true).setAutocomplete(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica a retirada de XP.').setRequired(true))),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const player = await loadPlayer((interaction.member as GuildMember).id);

		if (!player) {
			await interaction.editReply('Jogador não cadastrado. Utilize /registrar para se cadastrar.');
			return;
		}

		const subcommand = interaction.options.getSubcommand();
		const rawCharacterName = interaction.options.getString('personagem')!;
		let characterName = rawCharacterName.trim();

		if (/\d/.test(characterName.charAt(0))) {
			await interaction.editReply('O nome do personagem não pode começar com números.');
			return;
		}

		if (/[^\w\s]/.test(characterName)) {
			await interaction.editReply('O nome do personagem não pode conter caracteres especiais.');
			return;
		}

		characterName = characterName.replace(/\s+/g, ' ');
		const characterKey = characterName.toLowerCase().replace(' ', '_');

		if (subcommand === 'adicionar') {
			const character = new Character(characterName);

			if (player.characters[characterKey]) {
				await interaction.editReply('Já existe um personagem com este nome.');
				return;
			}

			player.registerCharacter(character, characterKey);

			try {
				await updatePlayer(player);
				await interaction.editReply(`Personagem ${characterName} adicionado com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao adicionar personagem: ${error}`);
			}
		} else if (subcommand === 'remover') {
			if (!player.characters[characterKey]) {
				await interaction.editReply('Personagem não encontrado. Verifique o nome do personagem na lista.');
				return;
			}

			player.deleteCharacter(characterKey);

			try {
				await updatePlayer(player);
				await interaction.editReply(`Personagem ${characterName} removido com sucesso.`);
				(interaction.client.channels.cache.get(channels.xp!) as BaseGuildTextChannel).send(`Personagem ${characterName} de <@${(interaction.member as GuildMember).id}> deletado.`);
			} catch (error) {
				await interaction.editReply(`Falha ao deletar personagem: ${error}`);
			}
		} else if (subcommand === 'renomear') {
			const rawNewName = interaction.options.getString('nome')!;
			let newName = rawNewName.trim();

			if (/\d/.test(newName.charAt(0))) {
				await interaction.editReply('O nome do personagem não pode começar com números.');
				return;
			}

			if (/[^\w\s]/.test(newName)) {
				await interaction.editReply('O nome do personagem não pode conter caracteres especiais.');
				return;
			}

			newName = newName.replace(/\s+/g, ' ');
			const newKey = newName.toLowerCase().replace(' ', '_');

			if (!player.characters[characterKey]) {
				await interaction.editReply('Personagem não encontrado. Verifique a lista de personagens');
				return;
			}
			if (player.characters[newKey]) {
				await interaction.editReply('Já existe um personagem com este nome.');
				return;
			}

			const oldName = player.characters[characterKey].name;

			player.renameCharacter(characterKey, newKey, newName);

			try {
				await updatePlayer(player);
				await interaction.editReply(`Personagem ${oldName} renomeado para ${newName}.`);
				(interaction.client.channels.cache.get(channels.xp!) as BaseGuildTextChannel).send(`Personagem ${oldName} de <@${(interaction.member as GuildMember).id}> renomeado para ${newName}.`);
			} catch (error) {
				await interaction.editReply(`Falha ao renomear personagem: ${error}`);
			}
		} else if (subcommand === 'add-xp') {
			const source = interaction.options.getString('origem')!;

			if (!sourceValidation(source)) {
				interaction.editReply('Origem inválida.');
				return;
			}

			if (!player.characters[characterKey]) {
				await interaction.editReply('Personagem não encontrado. Verifique o nome do personagem na lista.');
				return;
			}

			const addedXp = interaction.options.getInteger('xp')!;

			player.addXp(characterKey, addedXp);

			try {
				const log = new Log('xp', (interaction.member as GuildMember).id, channels.xp!, xpLogBuilder(player, characterKey, addedXp, source));

				await updatePlayer(player);
				await registerLog(log, (interaction.member as GuildMember).id);
				(interaction.client.channels.cache.get(channels.xp!) as BaseGuildTextChannel).send(log.content);
				await interaction.editReply(`${addedXp} XP adicionados ao personagem ${characterName} com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao adicionar XP ao personagem: ${error}`);
			}
		} else if (subcommand === 'sub-xp') {
			const source = interaction.options.getString('origem')!;
			const removedXp = interaction.options.getInteger('xp')!;

			if (!sourceValidation(source)) {
				interaction.editReply('Origem inválida.');
				return;
			}

			if (!player.characters[characterKey]) {
				await interaction.editReply('Personagem não encontrado. Verifique o nome do personagem na lista.');
				return;
			}

			if (player.characters[characterKey].xp < removedXp) {
				await interaction.editReply('XP do personagem não pode ficar abaixo de 0');
				return;
			}


			player.subXp(characterKey, removedXp);

			try {
				const log = new Log('xp', (interaction.member as GuildMember).id, channels.xp!, xpLogBuilder(player, characterKey, -removedXp, source));

				await updatePlayer(player);
				await registerLog(log, (interaction.member as GuildMember).id);
				(interaction.client.channels.cache.get(channels.xp!) as BaseGuildTextChannel).send(log.content);
				await interaction.editReply(`${removedXp} XP subtraídos do personagem ${characterName} com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao subtrair XP do personagem: ${error}`);
			}
		}
	},
};