import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { sellItem } from '../../lib/controllers/shop';

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
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user!.id;
    const player = await loadPlayer(author);
    const characterName = interaction.options.getString('personagem')!;
    const item = interaction.options.getString('item')!;
    const amount = interaction.options.getInteger('quantidade')!;
    const price = Math.floor(interaction.options.getInteger('preço')! * amount / 2);
    const vendingChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const character = player?.getCharacter(characterName);

    try {
      await sellItem(player, character, { name: item, price: price }, amount, vendingChannel, bankChannel);
      await interaction.editReply(`${amount}x ${item} vendido(s) com sucesso!`);
    } catch (error) {
      await interaction.editReply(`Falha ao realizar a venda: ${error}`);
    }
  }
}