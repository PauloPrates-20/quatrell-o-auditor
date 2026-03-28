import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder, InteractionResponse } from 'discord.js';
import { updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { Character, Log, Player } from '../../lib/classes';
import { Item } from '../../lib/definitions';
import { inventoryLogBuilder } from '../../lib/messages';
import { getPlayer } from '../../lib/listCache';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bau')
        .setDescription('Gerencia o inventário de um personagem.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('depositar')
                .setDescription('Adiciona um item ao inventário do personagem')
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
                )
                .addIntegerOption(option =>
                    option
                        .setName('quantidade')
                        .setDescription('Quantidade de items para adicionar.')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addIntegerOption(option =>
                    option
                        .setName('preço')
                        .setDescription('Valor do item')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('Link da mensagem ou motivo do depósito.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('itembase')
                        .setDescription('Nome do item base caso este item já tenha sido reforjado')
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('retirar')
                .setDescription('Retira um item do inventário do personagem')
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
                .addIntegerOption(option =>
                    option
                        .setName('quantidade')
                        .setDescription('Quantidade de items para retirar.')
                        .setMinValue(1)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('origem')
                        .setDescription('Link da mensagem ou motivo da retirada.')
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user!.id;
        let player: Player;
        let character: Character;
        const charName = interaction.options.getString('personagem')!;
        const itemName = interaction.options.getString('item')!;
        const amount = interaction.options.getInteger('quantidade')!;
        const source = interaction.options.getString('origem')!;
        const subcommand = interaction.options.getSubcommand();
        const inventoryChannel = interaction.client.channels.cache.get(channels.inventory!) as TextChannel;

        try {
            player = getPlayer(author);
            character = new Character({ ...player.getCharacter(charName) });
        } catch(e: any) {
            await interaction.editReply(e.message);
            return;
        }

        if(subcommand === 'depositar') {
            const price = interaction.options.getInteger('preço')!;
            const baseItem = interaction.options.getString('itembase');
            const item: Item = {
                name: itemName,
                price,
                count: amount,
            }

            if(baseItem) {
                item.baseItem = baseItem;
                item.shortName = item.name;
                item.name += ` (${baseItem})`;
            }

            try {
                character.addItem(item);
                player.updateCharacter(charName, character);
                
                const log = new Log('item', author, inventoryChannel.id, inventoryLogBuilder(author, 'deposita', character, item, source));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    inventoryChannel.send(log.content),
                ]);

                await interaction.editReply(`${amount}x ${item.name} depositado(s) com sucesso.`);
            } catch(e: any) {
                await interaction.editReply(`Falha ao depositar itens: ${e.message}`);
            }
        } else if(subcommand === 'retirar') {
            try {
                const item = { ...character.getItem(itemName), count: amount };

                character.removeItem(item);
                player.updateCharacter(charName, character);

                const log = new Log('item', author, inventoryChannel.id, inventoryLogBuilder(author, 'retira', character, item, source));

                await Promise.all([
                    updatePlayer(player),
                    registerLog(log, author),
                    inventoryChannel.send(log.content),
                ]);

                await interaction.editReply(`${amount}x ${item.name} retirado(s) com sucesso.`);
            } catch(e: any) {
                await interaction.editReply(`Falha ao retirar itens: ${e.message}`);
            }
        }
    }
}