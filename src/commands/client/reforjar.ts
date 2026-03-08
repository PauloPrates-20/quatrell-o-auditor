import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log } from '../../lib/classes';
import { goldLogBuilder, inventoryLogBuilder, reforgeLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Item } from '../../lib/definitions';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reforjar')
        .setDescription('Reforja itens para o jogador.')
        .addStringOption(option =>
            option
                .setName('personagem')
                .setDescription('Nome do personagem que receberá o item')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Item a ser reforjado')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('reforjado')
                .setDescription('Nome do item reforjado')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('preço')
                .setDescription('Preço total do item reforjado')
                .setMinValue(1)
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('upgrade')
                .setDescription('Indica se a reforja é um upgrade direto do item anterior')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user!.id;
        let player;
        let character;
        const charName = interaction.options.getString('personagem')!;
        const itemName = interaction.options.getString('item')!;
        const reforgeName = interaction.options.getString('reforjado')!;
        const isUpgrade = interaction.options.getBoolean('upgrade');
        let price = interaction.options.getInteger('preço')!;
        const forgeChannel = interaction.client.channels.cache.get(channels.forge!) as TextChannel;
        const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
        const inventoryChannel = interaction.client.channels.cache.get(channels.inventory!) as TextChannel;

        try {
            player = await loadPlayer(author);
            character = new Character({ ...player.getCharacter(charName) });
            const oldItem = { ...character.getItem(itemName), count: 1 };
            const newItem: Item = { 
                name: reforgeName + ` (${itemName})`,
                shortName: reforgeName,
                price,
                count: 1,
                baseItem: itemName,
            };

            if(isUpgrade) {
                if(!oldItem.baseItem) {
                    throw new Error('o item está na sua forma base.')
                }

                newItem.baseItem = oldItem.baseItem;
                newItem.name = reforgeName + ` (${newItem.baseItem})`;
                price -= oldItem.price

                if(oldItem.attuned) {
                    newItem.attuned = oldItem.attuned;
                }

                if(price < 0) {
                    throw new Error('valor do upgrade não pode ser inferior a 0 PO.');
                }
            }
            
            player.subGold(price);
            character.removeItem(oldItem);
            character.addItem(newItem);
            player.updateCharacter(charName, character);

            const forgeLog = new Log('forge', author, forgeChannel.id, reforgeLogBuilder(author, character, oldItem, newItem, newItem.price));
            const forgeMessage = await forgeChannel.send(forgeLog.content);
            const goldLog = new Log('gold', author, bankChannel.id, goldLogBuilder(player, 'retira', price, forgeMessage.url));
            const oldInventoryLog = new Log('item', author, inventoryChannel.id, inventoryLogBuilder(author, 'deposita', character, oldItem, forgeMessage.url));
            const newInventoryLog = new Log('item', author, inventoryChannel.id, inventoryLogBuilder(author, 'deposita', character, newItem, forgeMessage.url));

            await Promise.all([
                updatePlayer(player),
                registerLog(forgeLog, author),
                registerLog(goldLog, author),
                registerLog(oldInventoryLog, author),
                registerLog(newInventoryLog, author),
                bankChannel.send(goldLog.content),
                inventoryChannel.send(oldInventoryLog.content),
                inventoryChannel.send(newInventoryLog.content),
            ]);

            await interaction.editReply(`${itemName} reforjado para ${reforgeName}!`);
        } catch (e: any) {
            await interaction.editReply(`Falha ao reforjar item: ${e.message}`);
        }
    }
}