import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log, Sanitizer } from '../../lib/classes';
import { goldLogBuilder, purchaseLogBuilder } from '../../lib/messages';
import { channels } from '../../config';

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
    const characterInput = interaction.options.getString('personagem')!;
    const { key: characterKey } = Sanitizer.character(characterInput);
    const item = interaction.options.getString('item')!;
    const amount = interaction.options.getInteger('quantidade')!;
    const price = interaction.options.getInteger('preço')! * amount;
    const purchaseChannel = interaction.client.channels.cache.get(channels.shop!) as TextChannel;
    const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

    if (!player) {
      await interaction.editReply('Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar.');
      return;
    }

    const character = player.characters[characterKey];

    if (!character) {
      await interaction.editReply('Personagem não encontrado! Utilize o comando `/listar` para ver seus personagens.');
      return;
    }

    if (player.gold < price) {
      await interaction.editReply('Ouro insuficiente!');
      return;
    }

    const purchaseLog = new Log('purchase', author, purchaseChannel.id, purchaseLogBuilder(author, character, item, amount, price));

    try {
      const purchaseMessage = await purchaseChannel.send(purchaseLog.content);
      await registerLog(purchaseLog, author);

      player.subGold(price);
      const goldLog = new Log('gold', author, bankChannel.id, goldLogBuilder(player, 'retira', price, purchaseMessage.url));

      await updatePlayer(player);
      await bankChannel.send(goldLog.content);
      await registerLog(goldLog, author);

      await interaction.editReply(`${amount}x ${item} comprado(s) com sucesso!`);
    } catch (error) {
      await interaction.editReply(`Falha ao realizar a compra: ${error}`);
    }
  }
}