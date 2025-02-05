/* Imports */
import { BaseGuildTextChannel, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder, transferencyLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transferir')
		.setDescription('Transfere ouro ou gemas para outro jogador.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('ouro')
				.setDescription('Transfere ouro para outro jogador.')
				.addUserOption(option => option.setName('jogador').setDescription('Jogador que vai receber a transferência.').setRequired(true))
				.addIntegerOption(option => option.setName('ouro').setDescription('Quantidade de ouro para transferir').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('gema')
				.setDescription('Transfere gemas para outro jogador.')
				.addUserOption(option => option.setName('jogador').setDescription('Jogador que vai receber a transferência.').setRequired(true))
				.addStringOption(option =>
					option
						.setName('tipo')
						.setDescription('Tipo de gema a transferir.')
						.addChoices(
							{ name: 'Comum', value: 'comum' },
							{ name: 'Transmutação', value: 'transmutacao' },
							{ name: 'Ressureição', value: 'ressureicao' },
						)
						.setRequired(true),
				)
				.addIntegerOption(option => option.setName('gemas').setDescription('Quantidade de gemas a transferir').setRequired(true)),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const gemTypes = { comum: 'Comum', transmutacao: 'Transmutação', ressureicao: 'Ressureição' };
		const author = (interaction.member as GuildMember).id;
		const target = (interaction.options.getMember('jogador') as GuildMember).id;

		if (author === target) {
			await interaction.editReply('Não é possível transferir para si mesmo.');
			return;
		}

		const transferencyChannel = channels.transferencies!;
		const [authorPlayer, targetPlayer] = await Promise.all([loadPlayer(author), loadPlayer(target)]);
		const subcommand = interaction.options.getSubcommand();

		if (!authorPlayer) {
			await interaction.editReply('Jogador não encontrado. Utilize /registrar para se cadastrar.');
			return;
		}
		if (!targetPlayer) {
			await interaction.editReply('Jogador alvo não encontado.');
			return;
		}

		if (subcommand === 'ouro') {
			const amount = interaction.options.getInteger('ouro')!;
			const goldLogChannel = channels.bank!;

			if (authorPlayer.gold < amount) {
				await interaction.editReply('Ouro insuficiente.');
				return;
			}

			const transferencyLog = new Log('transferencia', [author, target], transferencyChannel, transferencyLogBuilder('ouro', [author, target], amount));
			const sourceMessage = await (interaction.client.channels.cache.get(transferencyChannel) as BaseGuildTextChannel)!.send(transferencyLog.content);
			const source = sourceMessage.url;

			authorPlayer.subGold(amount);
			targetPlayer.addGold(amount);

			const authorLog = new Log('ouro', author, goldLogChannel, goldLogBuilder(authorPlayer, 'retira', amount, source));
			const targetLog = new Log('ouro', target, goldLogChannel, goldLogBuilder(targetPlayer, 'deposita', amount, source));

			(interaction.client.channels.cache.get(goldLogChannel) as BaseGuildTextChannel)!.send(authorLog.content);
			(interaction.client.channels.cache.get(goldLogChannel) as BaseGuildTextChannel)!.send(targetLog.content);

			try {
				await Promise.all(
					[
						updatePlayer(authorPlayer),
						registerLog(authorLog, author),
						updatePlayer(targetPlayer),
						registerLog(targetLog, target),
					],
				);
				await interaction.editReply(`${amount} PO transferidos para <@${target}>.`);
			} catch (error) {
				await interaction.editReply(`Falha ao realizar transferência: ${error}`);
			}
		} else if (subcommand === 'gema') {
			const gemType = interaction.options.getString('tipo') as keyof Gems;
			const amount = interaction.options.getInteger('gemas')!;
			const gemChannel = channels.treasure!;

			if (authorPlayer.gems[gemType] < amount) {
				await interaction.editReply('Gemas insuficientes');
				return;
			}

			const transferencyLog = new Log('transferencia', [author, target], transferencyChannel, transferencyLogBuilder('gema', [author, target], amount, gemType));
			const sourceMessage = await (interaction.client.channels.cache.get(transferencyChannel) as BaseGuildTextChannel)!.send(transferencyLog.content);
			const source = sourceMessage.url;

			authorPlayer.subGems(gemType, amount);
			targetPlayer.addGems(gemType, amount);

			const authorLog = new Log('gema', author, gemChannel, gemLogBuilder(authorPlayer, gemType, amount, 'retira', source));
			const targetLog = new Log('gema', target, gemChannel, gemLogBuilder(targetPlayer, gemType, amount, 'deposita', source));

			(interaction.client.channels.cache.get(gemChannel) as BaseGuildTextChannel)!.send(authorLog.content);
			(interaction.client.channels.cache.get(gemChannel) as BaseGuildTextChannel)!.send(targetLog.content);

			try {
				await Promise.all(
					[
						updatePlayer(authorPlayer),
						registerLog(authorLog, author),
						updatePlayer(targetPlayer),
						registerLog(targetLog, target),
					],
				);
				await interaction.editReply(`${amount} Gema(s) ${gemTypes[gemType]} transferidas para <@${target}>.`);
			} catch (error) {
				await interaction.editReply(`Falha ao realizar transferência: ${error}`);
			}
		}
	},
};