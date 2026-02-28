/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log, Sanitizer } from '../../lib/classes';
import { validateSource } from '../../lib/validation';
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
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remover')
                .setDescription('Remove o personagem escolhido da lista de personagens do jogador.')
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('renomear')
                .setDescription('Renomeia um personagem, mantendo seus atributos.')
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Personagem a ser renomeado.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('nome')
                        .setDescription('Novo nome.')
                        .setRequired(true)
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-xp')
                .setDescription('Adiciona XP ao personagem escolhido.')
                .addIntegerOption(option =>
                    option
                        .setName('xp')
                        .setDescription('Quantidade de XP a adicionar')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('URL apontando para a mensagem que justifica o ganho de XP.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sub-xp')
                .setDescription('Subtrai xp do personagem selecionado.')
                .addIntegerOption(option =>
                    option
                        .setName('xp')
                        .setDescription('Quantidade de xp a subtrair')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('URL apontando para a mensagem que justifica a retirada de XP.')
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user.id;
        let player;
        const subcommand = interaction.options.getSubcommand();
        const name = interaction.options.getString('personagem')!;
        const xpChannel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

        try {
            player = await loadPlayer(author);
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        if (subcommand === 'adicionar') {
            
            try {
                player.registerCharacter(new Character({ name }));

                await updatePlayer(player);
                await interaction.editReply(`Personagem ${name} adicionado com sucesso.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao adicionar personagem: ${e.message}`);
            }
        } else if (subcommand === 'remover') {
            try {
                player.deleteCharacter(name);

                await Promise.all([
                    updatePlayer(player),
                    xpChannel.send(`Personagem ${name} de <@${(interaction.member as GuildMember).id}> deletado.`),
                ]);

                await interaction.editReply(`Personagem ${name} removido com sucesso.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao deletar personagem: ${e.message}`);
            }
        } else if (subcommand === 'renomear') {
            const newName = interaction.options.getString('nome')!;

            try {
                player.renameCharacter(name, newName);

                await Promise.all([
                    updatePlayer(player),
                    xpChannel.send(`Personagem ${name} de <@${author}> renomeado para ${newName}.`),
                ]);

                await interaction.editReply(`Personagem ${name} renomeado para ${newName}.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao renomear personagem: ${e.message}`);
            }
        } else if (subcommand === 'add-xp') {
            const source = interaction.options.getString('origem')!;
            const xp = interaction.options.getInteger('xp')!;

            try {
                const character = new Character({ ...player.getCharacter(name)} );
                character.addXp(xp);
                player.updateCharacter(name, character);
                validateSource(source);
                const log = new Log('xp', author, xpChannel.id, xpLogBuilder(player, character, xp, source));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    xpChannel.send(log.content),
                ]);

                await interaction.editReply(`${xp} XP adicionados ao personagem ${name} com sucesso.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao adicionar XP ao personagem: ${e.message}`);
            }
        } else if (subcommand === 'sub-xp') {
            const source = interaction.options.getString('origem')!;
            const xp = interaction.options.getInteger('xp')!;

            try {
                const character = new Character(player.getCharacter(name));
                character.subXp(xp);
                player.updateCharacter(name, character);
                validateSource(source);
                const log = new Log('xp', author, xpChannel.id, xpLogBuilder(player, character, -xp, source));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    xpChannel.send(log.content),
                ]);

                await interaction.editReply(`${xp} XP subtraídos do personagem ${name} com sucesso.`);
            } catch (e: any) {
                await interaction.editReply(`Falha ao subtrair XP do personagem: ${e.message}`);
            }
        }
    },
};