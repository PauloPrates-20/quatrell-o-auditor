/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder, transferencyLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transferir')
        .setDescription('Transfere ouro ou gemas para outro jogador.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ouro')
                .setDescription('Transfere ouro para outro jogador.')
                .addUserOption(option =>
                    option
                        .setName('jogador')
                        .setDescription('Jogador que vai receber a transferência.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('ouro')
                        .setDescription('Quantidade de ouro para transferir')
                        .setRequired(true)
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('gema')
                .setDescription('Transfere gemas para outro jogador.')
                .addUserOption(option =>
                    option
                        .setName('jogador')
                        .setDescription('Jogador que vai receber a transferência.')
                        .setRequired(true)
                )
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
                .addIntegerOption(option =>
                    option
                        .setName('gemas')
                        .setDescription('Quantidade de gemas a transferir')
                        .setRequired(true)
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user.id;
        const target = interaction.options.getUser('jogador')!.id;
        const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!;
        const subcommand = interaction.options.getSubcommand();
        let authorPlayer, targetPlayer;

        if (author === target) {
            await interaction.editReply('Não é possível transferir para si mesmo.');
            return;
        }

        const transferencyChannel = interaction.client.channels.cache.get(channels.transferencies!) as TextChannel;

        try {
            [authorPlayer, targetPlayer] = await Promise.all([
                loadPlayer(author),
                loadPlayer(target),
            ]);
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        if (subcommand === 'ouro') {
            const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
            
            try {
                authorPlayer.subGold(amount);
                targetPlayer.addGold(amount);

                const transferencyLog = new Log('transferencia', [author, target], transferencyChannel.id, transferencyLogBuilder('ouro', [author, target], amount));
                const sourceMessage = await transferencyChannel!.send(transferencyLog.content);
                const source = sourceMessage.url;
                const authorLog = new Log('ouro', author, bankChannel.id, goldLogBuilder(authorPlayer, 'retira', amount, source));
                const targetLog = new Log('ouro', target, bankChannel.id, goldLogBuilder(targetPlayer, 'deposita', amount, source));

                await Promise.all(
                    [
                        updatePlayer(authorPlayer),
                        registerLog(authorLog, author),
                        updatePlayer(targetPlayer),
                        registerLog(targetLog, target),
                        bankChannel.send(authorLog.content),
                        bankChannel.send(targetLog.content),
                    ],
                );

                await interaction.editReply(`${amount} PO transferidos para <@${target}>.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao realizar transferência: ${e.message}`);
            }
        } else if (subcommand === 'gema') {
            const gemType = interaction.options.getString('tipo')!;
            const amount = interaction.options.getInteger('gemas')!;
            const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
            
            try {
                authorPlayer.subGems(gemType, amount);
                targetPlayer.addGems(gemType, amount);

                const transferencyLog = new Log('transferencia', [author, target], transferencyChannel.id, transferencyLogBuilder('gema', [author, target], amount, gemType as keyof Gems));
                const sourceMessage = await transferencyChannel.send(transferencyLog.content);
                const source = sourceMessage.url;

                const authorLog = new Log('gema', author, treasureChannel.id, gemLogBuilder(authorPlayer, gemType as keyof Gems, amount, 'retira', source));
                const targetLog = new Log('gema', target, treasureChannel.id, gemLogBuilder(targetPlayer, gemType as keyof Gems, amount, 'deposita', source));

                await Promise.all(
                    [
                        updatePlayer(authorPlayer),
                        registerLog(authorLog, author),
                        updatePlayer(targetPlayer),
                        registerLog(targetLog, target),
                        treasureChannel.send(authorLog.content),
                        treasureChannel.send(targetLog.content),
                    ],
                );

                await interaction.editReply(`${amount} Gema(s) ${GemTypes[gemType as keyof Gems]} transferidas para <@${target}>.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao realizar transferência: ${e.message}`);
            }
        }
    },
};