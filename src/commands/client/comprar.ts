import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { channels } from '../../config';
import { purchaseItem } from '../../lib/controllers/shop';

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
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user!.id;
    const player = await loadPlayer(author);
    const characterName = interaction.options.getString('personagem')!;
    const item = interaction.options.getString('item')!;
    const amount = interaction.options.getInteger('quantidade')!;
    const price = interaction.options.getInteger('preço')! * amount;
    const purchaseChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const character = player?.getCharacter(characterName);

    try {
      await purchaseItem(player, character, { name: item, price: price }, amount, purchaseChannel, bankChannel);
      await interaction.editReply(`${amount}x ${item} comprado(s) com sucesso!`);
    } catch (e: any) {
      console.error(`[ERROR] Falha ao realizar compra: ${e}`);
      await interaction.editReply(`Falha ao realizar a compra: ${e.message}`);
    }
  }
}