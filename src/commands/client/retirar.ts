/* Imports */
import { BaseGuildTextChannel, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder } from '../../lib/messages';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('retirar')
		.setDescription('Retira ouro ou gemas do jogador.')
		.addSubcommand(subcommnad =>
			subcommnad
				.setName('ouro')
				.setDescription('Retira ouro do jogador.')
				.addIntegerOption(option => option.setName('ouro').setDescription('Quantidade de ouro a retirar.').setRequired(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica o gasto.').setRequired(true)),
		)
		.addSubcommand(subcommnad =>
			subcommnad
				.setName('gema')
				.setDescription('retira gemas do jogador.')
				.addStringOption(option =>
					option
						.setName('tipo')
						.setDescription('Tipo de gema a ser retirada.')
						.addChoices(
							{ name: 'Comum', value: 'comum' },
							{ name: 'Transmutação', value: 'transmutacao' },
							{ name: 'Ressureição', value: 'ressureicao' },
						)
						.setRequired(true),
				)
				.addIntegerOption(option => option.setName('gemas').setDescription('Quantidade de gemas a retirar.').setRequired(true))
				.addStringOption(option => option.setName('origem').setDescription('URL apontando para a mensagem que justifica a retirada das gemas.').setRequired(true)),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		let channel;
		const gemType = { comum: 'Comum', ressureicao: 'da Ressureição', transmutacao: 'da Transmutação' };
		const author = (interaction.member! as GuildMember).id;
		const source = interaction.options.getString('origem')!;
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
			channel = channels.bank!;
			const gold = interaction.options.getInteger('ouro')!;

			if (player.gold < gold) {
				await interaction.editReply('Ouro insuficiente.');
				return;
			}

			player.subGold(gold);

			const goldLog = new Log('ouro', author.toString(), channel, goldLogBuilder(player, 'retira', gold, source));

			try {
				await updatePlayer(player);
				await registerLog(goldLog, author);
				(interaction.client.channels.cache.get(channel) as BaseGuildTextChannel)!.send(goldLog.content);
				await interaction.editReply(`${gold} PO retirados com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao retirar ouro: ${error}`);
			}
		} else if (subcommand === 'gema') {
			channel = channels.treasure!;
			const type = interaction.options.getString('tipo') as keyof Gems;
			const gems = interaction.options.getInteger('gemas')!;

			if (player.gems[type] < gems) {
				await interaction.editReply('Gemas insuficientes.');
				return;
			}

			player.subGems(type, gems);

			const gemLog = new Log('gema', author.toString(), channel, gemLogBuilder(player, type, gems, 'retira', source));

			try {
				await updatePlayer(player);
				await registerLog(gemLog, author);
				(interaction.client.channels.cache.get(channel) as BaseGuildTextChannel)!.send(gemLog.content);
				await interaction.editReply(`${gems} Gema(s) ${gemType[type]} retirada(s) com sucesso.`);
			} catch (error) {
				await interaction.editReply(`Falha ao retirar gemas: ${error}`);
			}
		}
	},
};