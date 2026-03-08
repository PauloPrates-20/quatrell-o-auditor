import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log } from '../../lib/classes';
import { goldLogBuilder, inventoryLogBuilder, purchaseLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Item } from '../../lib/definitions';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comprar')
        .setDescription('Realiza compras de itens para o jogador.')
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
                .setDescription('Nome do item')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de items a comprar')
                .setMinValue(1)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('preço')
                .setDescription('Preço unitário do item comprado')
                .setMinValue(1)
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user!.id;
        let player;
        let character;
        const charName = interaction.options.getString('personagem')!;
        const itemName = interaction.options.getString('item')!;
        const amount = interaction.options.getInteger('quantidade')!;
        const price = interaction.options.getInteger('preço')! * amount;
        const purchaseChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
        const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
        const inventoryChannel = interaction.client.channels.cache.get(channels.inventory!) as TextChannel;

        try {
            const item: Item = { 
                name: itemName,
                count: amount,
                price: price / amount,
            }
            player = await loadPlayer(author);
            character = new Character({ ...player.getCharacter(charName) });
            character.addItem(item);
            player.updateCharacter(charName, character);
            player.subGold(price);

            const purchaseLog = new Log('purchase', author, purchaseChannel.id, purchaseLogBuilder(author, character, itemName, amount, price));
            const purchaseMessage = await purchaseChannel.send(purchaseLog.content);
            const goldLog = new Log('gold', author, bankChannel.id, goldLogBuilder(player, 'retira', price, purchaseMessage.url));
            const inventoryLog = new Log('item', author, inventoryChannel.id, inventoryLogBuilder(author, 'deposita', character, item, purchaseMessage.url));

            await Promise.all([
                updatePlayer(player),
                registerLog(purchaseLog, author),
                registerLog(goldLog, author),
                registerLog(inventoryLog, author),
                bankChannel.send(goldLog.content),
                inventoryChannel.send(inventoryLog.content)
            ]);

            await interaction.editReply(`${amount}x ${itemName} comprado(s) com sucesso!`);
        } catch (e: any) {
            await interaction.editReply(`Falha ao realizar a compra: ${e.message}`);
        }
    }
}