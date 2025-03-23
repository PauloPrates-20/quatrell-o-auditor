import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, vendingLogBuilder } from '../../lib/messages';
import { channels } from '../../config';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vender')
    .setDescription('Realiza vendas de itens para o jogador.')
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
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user!.id;
    const player = await loadPlayer(author);
    const item = interaction.options.getString('item')!;
    const amount = interaction.options.getInteger('quantidade')!;
    const price = Math.floor(interaction.options.getInteger('preço')! * amount / 2);
    const vendingChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

    if (!player) {
      await interaction.editReply('Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar.');
      return;
    }

    const vendingLog = new Log('vending', author, vendingChannel.id, vendingLogBuilder(author, item, amount, price));

    try {
      const vendingMessage = await vendingChannel.send(vendingLog.content);
      await registerLog(vendingLog, author);
      
      player.addGold(price);
      const goldLog = new Log('gold', author, bankChannel.id, goldLogBuilder(player, 'deposita', price, vendingMessage.url));

      await updatePlayer(player);
      await bankChannel.send(goldLog.content);
      await registerLog(goldLog, author);

      await interaction.editReply(`${amount}x ${item} vendido(s) com sucesso!`);
    } catch (error) {
      await interaction.editReply(`Falha ao realizar a venda: ${error}`);
    }
  }
}