import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder, InteractionResponse } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Character, Log, Player } from '../../lib/classes';
import { Item } from '../../lib/definitions';
import { attuneLogBuilder } from '../../lib/messages';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sintonia')
        .setDescription('Gerencia o inventário de um personagem.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('sintonizar')
                .setDescription('Sintoniza um item')
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('Item a adicionar')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('dessintonizar')
                .setDescription('Dessintoniza um item.')
                .addStringOption(option =>
                    option
                        .setName('personagem')
                        .setDescription('Nome do personagem')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('Item a retirar')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user!.id;
        let player: Player;
        let character: Character;
        let item: Item;
        const charName = interaction.options.getString('personagem')!;
        const itemName = interaction.options.getString('item')!;
        const subcommand = interaction.options.getSubcommand();
        const magicChannel = interaction.client.channels.cache.get(channels.magic!) as TextChannel;

        try {
            player = await loadPlayer(author);
            character = new Character({ ...player.getCharacter(charName) });
            item = character.getItem(itemName);
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        if(subcommand === 'sintonizar') {
            try {
                character.attuneItem(itemName);
                player.updateCharacter(charName, character);
                
                const log = new Log('item', author, magicChannel.id, attuneLogBuilder(author, 'sintoniza', character, item));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    magicChannel.send(log.content),
                ]);

                await interaction.editReply(`${itemName} sintonizado com sucesso.`);
            } catch(e: any) {
                await interaction.editReply(`Falha ao sintonizar item: ${e.message}`);
            }
        } else if(subcommand === 'dessintonizar') {
            try {
                character.deAttuneItem(itemName);
                player.updateCharacter(charName, character);

                const log = new Log('item', author, magicChannel.id, attuneLogBuilder(author, 'dessintoniza', character, item));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    magicChannel.send(log.content),
                ]);

                await interaction.editReply(`${itemName} dessintonizado com sucesso.`);
            } catch(e: any) {
                await interaction.editReply(`Falha ao dessintonizar item: ${e.message}`);
            }
        }
    }
}