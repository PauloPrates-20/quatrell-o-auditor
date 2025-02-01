/* Imports */
const { SlashCommandBuilder } = require('discord.js');
const { loadPlayer, updatePlayer, registerLog } = require('../../lib/firebase/firestoreQuerys');
const { Log } = require('../../lib/classes');
const { goldLogBuilder, gemLogBuilder } = require('../../lib/messages');
const { sourceValidation } = require('../../lib/validation');
const { channels } = require('../../config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('depositar')
		.setDescription('Deposita ouro ou gemas para o jogador.')
		.addSubcommand(subcommnad =>
			subcommnad
				.setName('ouro')
				.setDescription('Deposita ouro para o jogador.')
				.addIntegerOption(option => option.setName('ouro').setDescription('Quantidade de ouro a depositar.').setRequired(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica a origem do ouro.').setRequired(true)),
		)
		.addSubcommand(subcommnad =>
			subcommnad
				.setName('gema')
				.setDescription('Deposita gemas para o jogador.')
				.addStringOption(option =>
					option
						.setName('tipo')
						.setDescription('Tipo de gema a ser adicionada.')
						.addChoices(
							{ name: 'Comum', value: 'comum' },
							{ name: 'Transmutação', value: 'transmutacao' },
							{ name: 'Ressureição', value: 'ressureicao' },
						)
						.setRequired(true),
				)
				.addIntegerOption(option => option.setName('gemas').setDescription('Quantidade de gemas a depositar.').setRequired(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica a origem das gemas.').setRequired(true)),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		let channel;
		const gemType = { comum: 'Comum', ressureicao: 'da Ressureição', transmutacao: 'da Transmutação' };
		const author = interaction.member.id;
		const source = interaction.options.getString('origem');
		const subcommand = interaction.options.getSubcommand();
		const player = await loadPlayer(author);


		if (!sourceValidation(source)) {
			await interaction.editReply('Origem inválida.');
			return;
		}

		if (!player) {
			await interaction.editReply('Jogador não encontrado. Utilize /registrar para se cadastrar.');
			return;
		}

		if (subcommand === 'ouro') {
			channel = channels.banco;
			const gold = interaction.options.getInteger('ouro');

			player.addGold(gold);

			const goldLog = new Log('ouro', author.toString(), channel, goldLogBuilder(player, 'deposita', gold, source));

			try {
				await updatePlayer(player);
				await registerLog(goldLog, author);
				interaction.client.channels.cache.get(channel).send(goldLog.content);
				await interaction.editReply(`${gold} PO adicionados com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao depositar ouro: ${error}`);
			}
		} else if (subcommand === 'gema') {
			channel = channels.gemas;
			const type = interaction.options.getString('tipo');
			const gems = interaction.options.getInteger('gemas');

			player.addGems(type, gems);

			const gemLog = new Log('gema', author.toString(), channel, gemLogBuilder(player, type, gems, 'deposita', source));

			try {
				await updatePlayer(player);
				await registerLog(gemLog, author);
				interaction.client.channels.cache.get(channel).send(gemLog.content);
				await interaction.editReply(`${gems} Gema(s) ${gemType[type]} adicionada(s) com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao depositar gemas: ${error}`);
			}
		}
	},
};