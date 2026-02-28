import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, Message } from 'discord.js'
import { channels } from '../../config';
import { validateSource } from '../../lib/validation';
import { Character, Log, Player, Sanitizer } from '../../lib/classes';
import { loadPlayer, registerLog, updatePlayer } from '../../lib/firebase/firestoreQuerys';
import { gemLogBuilder, goldLogBuilder, xpLogBuilder } from '../../lib/messages';
import { Actions, Gems } from '../../lib/definitions';

async function fetchMessage(
    interaction: ChatInputCommandInteraction,
    messageId: string,
    messageChannel: string,
    baseUrl: string,
    channel: TextChannel
): Promise<Message | null> {
    if (messageChannel !== channel.id) {
        await interaction.editReply(`Mensagem inválida: selecione uma mensagem no canal ${baseUrl}/${channel.id}`)
    }

    return await channel.messages.fetch(messageId);
}

async function applyCorrection(
    player: Player,
    author: string,
    log: Log,
    channel: TextChannel,
    messageUrl: string,
    message: Message,
    interaction: ChatInputCommandInteraction
) {
    Promise.all([
        updatePlayer(player),
        registerLog(log, author),
        channel.send(`Correção do lançamento ${messageUrl}\n\n` + log.content),
        message.react('❌'),
        interaction.editReply('Lançamento corrigido com sucesso.'),
    ]);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('corrigir')
        .setDescription('Corrige lançamentos errados')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ouro')
                .setDescription('Corrige um lançamento jogador no banco.')
                .addStringOption(option =>
                    option
                        .setName('mensagem')
                        .setDescription('A URL da mensagem a corrigir')
                        .setRequired(true)
                )
                .addStringOption(options =>
                    options
                        .setName('ação')
                        .setDescription('Define se o lançamento deve adicionar ou remover')
                        .addChoices(
                            { name: 'Adicionar', value: 'deposita' },
                            { name: 'Retirar', value: 'retira' }
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('ouro')
                        .setDescription('Valor correto para o lançamento.')
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('A URL da mensagem que justifica o lançamento.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('gema')
                .setDescription('Corrige um lançamento jogador no banco.')
                .addStringOption(option =>
                    option
                        .setName('mensagem')
                        .setDescription('A URL da mensagem a corrigir')
                        .setRequired(true)
                )
                .addStringOption(options =>
                    options
                        .setName('ação')
                        .setDescription('Define se o lançamento deve adicionar ou remover')
                        .addChoices(
                            { name: 'Adicionar', value: 'deposita' },
                            { name: 'Retirar', value: 'retira' }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('tipo')
                        .setDescription('Tipo correto das gemas para o lançamento')
                        .addChoices(
                            { name: 'Comum', value: 'comum' },
                            { name: 'Transmutação', value: 'transmutacao' },
                            { name: 'Ressureição', value: 'ressureicao' }
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('gemas')
                        .setDescription('Valor correto para o lançamento.')
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('A URL da mensagem que justifica o lançamento.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('xp')
                .setDescription('Corrige um lançamento jogador no banco.')
                .addStringOption(option =>
                    option
                        .setName('mensagem')
                        .setDescription('A URL da mensagem a corrigir')
                        .setRequired(true)
                )
                .addStringOption(options =>
                    options
                        .setName('ação')
                        .setDescription('Define se o lançamento deve adicionar ou remover')
                        .addChoices(
                            { name: 'Adicionar', value: 'deposita' },
                            { name: 'Retirar', value: 'retira' }
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('xp')
                        .setDescription('Valor correto para o lançamento.')
                )
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('A URL da mensagem que justifica o lançamento.')
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user.id;
        const clientGuild = interaction.guild!.id;
        const subcommand = interaction.options.getSubcommand();
        const messageUrl = interaction.options.getString('mensagem')!;
        const baseUrl = `https://discord.com/channels/${clientGuild}`;
        let player;

        let amount = interaction.options.getInteger('ouro') ??
            interaction.options.getInteger('gemas') ??
            interaction.options.getInteger('xp');
        let action = interaction.options.getString('ação');
        let source = interaction.options.getString('origem');
        let type = interaction.options.getString('tipo');
        let character = interaction.options.getString('personagem');
        let name = character ?? '';

        try {
            validateSource(messageUrl, source);
            player = await loadPlayer(author)
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        const [messageGuild, messageChannel, messageId] = Sanitizer.urlComponents(messageUrl);

        if (messageGuild !== clientGuild) {
            await interaction.editReply('Mensagem inválida. Selecione uma mensagem neste servidor.');
            return;
        }

        const actionPattern = /(Deposita|Retira)/;
        const amountPattern = /(?:Deposita|Retira): (-?\d+)/;
        const sourcePattern = /Origem: (.+)/;

        // subcommand handling
        if (subcommand === 'ouro') {
            const channel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
            const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);

            if (!message) {
                await interaction.editReply('Mensagem não encontrada.')
                return;
            }

            if (!message.mentions.has(author)) {
                await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
                return;
            }

            const content = message.content;
            const originalAction = content.match(actionPattern)![0].toLowerCase();
            const originalAmount = parseInt(content.match(amountPattern)![1]);
            const originalSource = content.match(sourcePattern)![1];

            action = action ?? originalAction;
            amount = amount ?? originalAmount;
            source = source ?? originalSource;

            if (originalAction === action) {
                if (originalAmount !== amount) {
                    if (action === 'deposita') {
                        player.subGold(originalAmount);
                        player.addGold(amount);
                    } else {
                        player.addGold(originalAmount);
                        player.subGold(amount);
                    }
                }
            } else {
                if (action === 'deposita') {
                    player.addGold(originalAmount);
                    player.addGold(amount);
                } else {
                    player.subGold(originalAmount);
                    player.subGold(amount);
                }
            }

            const log = new Log('ouro', author, channel.id, goldLogBuilder(player, action as Actions, amount, source));

            try {
                await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
            } catch (error: any) {
                await interaction.editReply(`Falha ao corrigir lançamento: ${error.message}`);
            }
        }

        if (subcommand === 'gema') {
            const channel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
            const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
            const typePattern = /(?:Gema\(s\)(?:\sda)?) (.+)/;

            if (!message) {
                await interaction.editReply('Mensagem não encontrada.')
                return;
            }

            if (!message.mentions.has(author)) {
                await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
                return;
            }

            const content = message.content;
            const originalAction = content.match(actionPattern)![0].toLowerCase();
            const originalAmount = parseInt(content.match(amountPattern)![1]);
            const originalType = Sanitizer.gemType(content.match(typePattern)![1]);
            const originalSource = content.match(sourcePattern)![1];

            action = action ?? originalAction;
            amount = amount ?? originalAmount;
            source = source ?? originalSource;
            type = type ?? originalType;

            if (originalAction === action) {
                if (originalAmount !== amount || originalType !== type) {
                    if (action === 'deposita') {
                        player.subGems(originalType, originalAmount);
                        player.addGems(type, amount);
                    } else {
                        player.addGems(originalType, originalAmount);
                        player.subGems(type, amount);
                    }
                }
            } else {
                if (action === 'deposita') {
                    player.addGems(originalType, originalAmount);
                    player.addGems(type, amount);
                } else {
                    player.subGems(originalType, originalAmount);
                    player.subGems(type, amount);
                }
            }

            const log = new Log('gema', author, channel.id, gemLogBuilder(player, type as keyof Gems, amount, action as Actions, source));

            try {
                await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
            } catch (error: any) {
                await interaction.editReply(`Falha ao corrigir lançamento: ${error.message}`);
            }
        }

        if (subcommand === 'xp') {
            const channel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;
            const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
            const characterPattern = /Personagem: (.+)/;
            const xpPattern = /(-?\d+) (?:XP)/

            if (!message) {
                await interaction.editReply('Mensagem não encontrada.')
                return;
            }

            if (!message.mentions.has(author)) {
                await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
                return;
            }

            const content = message.content;
            console.log(content);
            const originalAction = parseInt(content.match(xpPattern)![1]) < 0 ? 'retira' : 'deposita';
            const originalAmount = Math.abs(parseInt(content.match(xpPattern)![1]));
            const originalSource = content.match(sourcePattern)![1];
            const originalCharacter = content.match(characterPattern)![1];
            const originalName = originalCharacter;

            action = action ?? originalAction;
            amount = amount ?? originalAmount;
            source = source ?? originalSource;
            name = name ?? originalName;

            const prevCharacter = new Character({ ...player.getCharacter(originalName) });
            const newCharacter = new Character({ ...player.getCharacter(name) })

            if (originalAction === action) {
                if (originalAmount !== amount || originalName !== name) {
                    if (action === 'deposita') {
                        prevCharacter.subXp(originalAmount);
                        newCharacter.addXp(amount);
                    } else {
                        prevCharacter.addXp(originalAmount);
                        newCharacter.subXp(amount);
                    }
                }
            } else {
                if (action === 'deposita') {
                    prevCharacter.addXp(originalAmount);
                    newCharacter.addXp(amount);
                } else {
                    prevCharacter.subXp(originalAmount);
                    newCharacter.subXp(amount);
                }
            }

            player.updateCharacter(prevCharacter.name, prevCharacter);
            player.updateCharacter(newCharacter.name, newCharacter);
            const log = new Log('xp', author, channel.id, xpLogBuilder(player, name, action === 'retira' ? -amount : amount, source));

            try {
                if (originalName !== name) {
                    const oldLog = new Log('xp', author, channel.id, xpLogBuilder(player, originalName, originalAction === 'retira' ? originalAmount : -originalAmount, messageUrl))
                    await channel.send(`Correção do lançamento: ${messageUrl}\n\n` + oldLog.content);
                }
                await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
            } catch (error: any) {
                await interaction.editReply(`Falha ao corrigir lançamento: ${error.message}`);
            }
        }
    }
}