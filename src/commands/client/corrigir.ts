import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, Message } from 'discord.js'
import { channels } from '../../config';
import { sourceValidation } from '../../lib/validation';
import { Log, Player, Sanitizer } from '../../lib/classes';
import { loadPlayer, registerLog, updatePlayer } from '../../lib/firebase/firestoreQuerys';
import { goldLogBuilder } from '../../lib/messages';

async function fetchMessage(
  interaction: ChatInputCommandInteraction,
  messageId: string,
  messageChannel: string,
  baseUrl: string,
  channel: TextChannel
): Promise<Message | null> {
  if (messageChannel !== channel.id) {
    await interaction.editReply(`Mensagem inválida: selecione uma mensagem no canal ${baseUrl}/${channel.id}`)
  }

  return await channel.messages.fetch(messageId);
}

async function applyCorrection(player: Player, author: string, log: Log, channel: TextChannel, messageUrl: string) {
  await updatePlayer(player);
  await registerLog(log, author);
  await channel.send(`Correção do lançamento ${messageUrl}\n\n` + log.content);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('corrigir')
    .setDescription('Corrige lançamentos errados')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Corrige um lançamento jogador no banco.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('A URL da mensagem a corrigir')
            .setRequired(true)
        )
        .addStringOption(options =>
          options
            .setName('ação')
            .setDescription('Define se o lançamento deve adicionar ou remover')
            .addChoices(
              { name: 'Adicionar', value: 'deposita' },
              { name: 'Retirar', value: 'retira' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Valor correto para o lançamento.')
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('A URL da mensagem que justifica o lançamento.')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Corrige um lançamento jogador no banco.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('A URL da mensagem a corrigir')
            .setRequired(true)
        )
        .addStringOption(options =>
          options
            .setName('ação')
            .setDescription('Define se o lançamento deve adicionar ou remover')
            .addChoices(
              { name: 'Adicionar', value: 'deposita' },
              { name: 'Retirar', value: 'retira' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('gemas')
            .setDescription('Valor correto para o lançamento.')
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('A URL da mensagem que justifica o lançamento.')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('xp')
        .setDescription('Corrige um lançamento jogador no banco.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('A URL da mensagem a corrigir')
            .setRequired(true)
        )
        .addStringOption(options =>
          options
            .setName('ação')
            .setDescription('Define se o lançamento deve adicionar ou remover')
            .addChoices(
              { name: 'Adicionar', value: 'deposita' },
              { name: 'Retirar', value: 'retira' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Valor correto para o lançamento.')
        )
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('A URL da mensagem que justifica o lançamento.')
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const clientGuild = interaction.guild!.id;
    const subcommand = interaction.options.getSubcommand();
    const messageUrl = interaction.options.getString('mensagem')!;
    const baseUrl = `https://discord.com/channels/${clientGuild}`;
    const player = await loadPlayer(author);

    let amount = interaction.options.getInteger('ouro') ??
      interaction.options.getInteger('gemas') ??
      interaction.options.getInteger('xp');
    let action = interaction.options.getString('ação');
    let source = interaction.options.getString('origem');
    let character = interaction.options.getString('personagem');
    let { name, key } = character ? Sanitizer.character(character) : { name: null, key: null };


    if (!sourceValidation(messageUrl)) {
      await interaction.editReply('Mensagem inválida.');
      return;
    }

    if (source && !sourceValidation(source)) {
      await interaction.editReply('Origem inválida.');
      return;
    }

    if (!player) {
      await interaction.editReply('Jogador não encontrado. Utilize o comando `/registrar` para se cadastrar.');
      return;
    }

    if (name && /\d/.test(name.charAt(0))) {
      await interaction.editReply('O nome do personagem não pode começar com números.');
      return;
    }

    if (key && !player.characters[key]) {
      await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
      return;
    }

    const [messageGuild, messageChannel, messageId] = Sanitizer.urlComponents(messageUrl);

    if (messageGuild !== clientGuild) {
      await interaction.editReply('Mensagem inválida. Selecione uma mensagem neste servidor.');
      return;
    }

    let actionPattern = /(Deposita|Retira)/;
    let amountPattern = /(?:Deposita|Retira): (-?\d+)/;
    let characterPattern = /Personagem: (.+)/;
    let sourcePattern = /Origem: (.+)/;

    // subcommand handling
    if (subcommand === 'ouro') {
      const channel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.')
        return;
      }

      if (!message.mentions.has(author)) {
        await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
        return;
      }

      const content = message.content;
      const originalAction = content.match(actionPattern)![0].toLowerCase();
      const originalAmount = parseInt(content.match(amountPattern)![1]);
      const originalSource = content.match(sourcePattern)![1];

      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;

      console.log(action);

      if (originalAction === action) {
        if (originalAmount !== amount) {
          if (action === 'deposita') {
            player.subGold(originalAmount);
            player.addGold(amount);
          } else {
            player.addGold(originalAmount);

            if (player.gold < amount) {
              await interaction.editReply('Ouro insuficiente.');
              return;
            }

            player.subGold(amount);
          }
        }
      } else {
        if (action === 'deposita') {
          player.addGold(originalAmount);
          player.addGold(amount);
        } else {
          player.subGold(originalAmount);

          if (player.gold < amount) {
            await interaction.editReply('Ouro insuficiente.');
            return;
          }

          player.subGold(amount);
        }
      }

      const log = new Log('ouro', author, channel.id, goldLogBuilder(player, action as 'deposita' | 'retira', amount, source));

      try {
        await applyCorrection(player, author, log, channel, messageUrl);
        await message.react('❌');
        await interaction.editReply('Lançamento corrigido com sucesso.');
      } catch (error: any) {
        await interaction.editReply(`Falha ao corrigir lançamento: ${error.message}`);
      }
    }

    if (subcommand === 'gema') {
      const channel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.')
        return;
      }

      if (!message.mentions.has(author)) {
        await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
        return;
      }

      const content = message.content;
      const originalAction = content.match(actionPattern)![1];
      const originalAmount = parseInt(content.match(amountPattern)![1]);
      const originalSource = content.match(sourcePattern)![1];

      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
    }

    if (subcommand === 'xp') {
      const channel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.')
        return;
      }

      if (!message.mentions.has(author)) {
        await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
        return;
      }

      const content = message.content;
      const originalAction = content.match(actionPattern)![1];
      const originalAmount = parseInt(content.match(amountPattern)![1]);
      const originalSource = content.match(sourcePattern)![1];

      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
    }
  }
}