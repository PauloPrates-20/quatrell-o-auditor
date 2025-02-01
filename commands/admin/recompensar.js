/* Imports */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadPlayer, updatePlayer, registerLog } = require('../../lib/firebase/firestoreQuerys');
const { Log } = require('../../lib/classes');
const { goldLogBuilder, gemLogBuilder } = require('../../lib/messages');
const { channels } = require('../../config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recompensar')
		.setDescription('Deposita recompensas de doações para os jogadores.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ouro')
				.setDescription('Deposita a recompensa em ouro das doações.')
				.addUserOption(option => option.setName('jogador').setDescription('Jogador a receber a recompensa.').setRequired(true))
				.addIntegerOption(option => option.setName('ouro').setDescription('Quantidade de ouro a depositar.').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('gema')
				.setDescription('Deposita a recompensa em gemas das doações.')
				.addUserOption(option => option.setName('jogador').setDescription('Jogador a receber a recompensa.').setRequired(true))
				.addStringOption(option =>
					option
						.setName('tipo')
						.setDescription('Tipo de gema a depositar.')
						.addChoices(
							{ name: 'Comum', value: 'comum' },
							{ name: 'Transmutação', value: 'transmutacao' },
							{ name: 'Ressureição', value: 'ressureicao' },
						)
						.setRequired(true),
				)
				.addIntegerOption(option => option.setName('gemas').setDescription('Quantidade de gemas a depositar.').setRequired(true)),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const target = interaction.options.getMember('jogador').id;
		const subcommand = interaction.options.getSubcommand();
		const source = 'Recompensa por doação ao servidor.';
		const player = await loadPlayer(target);

		if (!player) {
			await interaction.editReply('Jogador não encontrado.');
			return;
		}

		if (subcommand === 'ouro') {
			const amount = interaction.options.getInteger('ouro');
			const channel = channels.banco;

			player.addGold(amount);

			const log = new Log('ouro', target, channel, goldLogBuilder(player, 'deposita', amount, source));

			try {
				await Promise.all([updatePlayer(player), registerLog(log, target)]);
				interaction.client.channels.cache.get(channel).send(log.content);
				await interaction.editReply(`${amount} PO depositados para <@${target}>.`);
			} catch (error) {
				await interaction.editReply(`Falha ao depositar recompensas: ${error}`);
			}
		} else if (subcommand === 'gema') {
			const gemTypes = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
			const channel = channels.gemas;
			const gemType = interaction.options.getString('tipo');
			const amount = interaction.options.getInteger('gemas');

			player.addGems(gemType, amount);

			const log = new Log('gema', target, channel, gemLogBuilder(player, gemType, amount, 'deposita', source));

			try {
				await Promise.all([updatePlayer(player), registerLog(log, target)]);
				interaction.client.channels.cache.get(channel).send(log.content);
				await interaction.editReply(`${amount} Gema(s) ${gemTypes[gemType]} depositadas para <@${target}>.`);
			} catch (error) {
				await interaction.editReply(`Falha ao depositar recompensas: ${error}`);
			}
		}
	},
};