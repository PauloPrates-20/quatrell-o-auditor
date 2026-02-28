import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log, Sanitizer } from '../../lib/classes';
import { goldLogBuilder, vendingLogBuilder } from '../../lib/messages';
import { channels } from '../../config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vender')
        .setDescription('Realiza vendas de itens para o jogador.')
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
                .setDescription('Preço unitário do item vendido (preço cheio)')
                .setMinValue(1)
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: 'Ephemeral' });

        const author = interaction.user!.id;
        let player;
        let character;
        const charName = interaction.options.getString('personagem')!;
        const item = interaction.options.getString('item')!;
        const amount = interaction.options.getInteger('quantidade')!;
        const price = Math.floor(interaction.options.getInteger('preço')! * amount / 2);
        const vendingChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
        const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

        try {
            player = await loadPlayer(author);
            character = new Character({ ...player.getCharacter(charName) });

            player.addGold(price);

            const vendingLog = new Log('vending', author, vendingChannel.id, vendingLogBuilder(author, character, item, amount, price));
            const vendingMessage = await vendingChannel.send(vendingLog.content);
            const goldLog = new Log('gold', author, bankChannel.id, goldLogBuilder(player, 'deposita', price, vendingMessage.url));
            
            await Promise.all([
                updatePlayer(player),
                registerLog(vendingLog, author),
                bankChannel.send(goldLog.content),
                registerLog(goldLog, author),
            ]);

            await interaction.editReply(`${amount}x ${item} vendido(s) com sucesso!`);
        } catch (error) {
            await interaction.editReply(`Falha ao realizar a venda: ${error}`);
        }
    }
}