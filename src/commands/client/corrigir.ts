import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, Message } from 'discord.js'
import { channels } from '../../config';
import { sourceValidation } from '../../lib/validation';
import { Player } from '../../lib/classes';
import { loadPlayer, registerLog, updatePlayer } from '../../lib/firebase/firestoreQuerys';
import { Actions, Gems } from '../../lib/definitions';
import { getGemType, getUrlComponents } from '../../lib/utils';
import { bankLog, gemLog, xpLog } from '../../lib/messages';

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

async function applyCorrection(
  player: Player,
  author: string,
  log: string,
  channel: TextChannel,
  messageUrl: string,
  message: Message,
  interaction: ChatInputCommandInteraction
) {
  Promise.all([
    updatePlayer(player),
    registerLog(log, author),
    channel.send(`Correção do lançamento ${messageUrl}\n\n` + log),
    message.react('❌'),
    interaction.editReply('Lançamento corrigido com sucesso.'),
  ]);
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
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo correto das gemas para o lançamento')
            .addChoices(
              { name: 'Comum', value: 'comum' },
              { name: 'Transmutação', value: 'transmutacao' },
              { name: 'Ressureição', value: 'ressureicao' }
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
    let type = interaction.options.getString('tipo');
    let name = interaction.options.getString('personagem');

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

    if (name && !player.getCharacter(name)) {
      await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
      return;
    }

    const [messageGuild, messageChannel, messageId] = getUrlComponents(messageUrl);

    if (messageGuild !== clientGuild) {
      await interaction.editReply('Mensagem inválida. Selecione uma mensagem neste servidor.');
      return;
    }

    const actionPattern = /(Deposita|Retira)/;
    const amountPattern = /(?:Deposita|Retira): (-?\d+)/;
    const sourcePattern = /Origem: (.+)/;

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

      if (originalAction === action) {
        if (originalAmount !== amount) {
          if (action === 'deposita') {
            player.updateGold(-originalAmount);
            player.updateGold(amount);
          } else {
            player.updateGold(originalAmount);

            if (player.gold < amount) {
              await interaction.editReply('Ouro insuficiente.');
              return;
            }

            player.updateGold(-amount);
          }
        }
      } else {
        if (action === 'deposita') {
          player.updateGold(originalAmount);
          player.updateGold(amount);
        } else {
          player.updateGold(-originalAmount);

          if (player.gold < amount) {
            await interaction.editReply('Ouro insuficiente.');
            return;
          }

          player.updateGold(amount);
        }
      }

      const log = bankLog(player, action as Actions, amount, source);

      try {
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao corrigir lançamento de ouro: ${e}`)
        await interaction.editReply(`Falha ao corrigir lançamento: ${e.message}`);
      }
    }

    if (subcommand === 'gema') {
      const channel = interaction.client.channels.cache.get(channels.treasure) as TextChannel;
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
      const typePattern = /(?:Gema\(s\)(?:\sda)?) (.+)/;

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
      const originalType = getGemType(content.match(typePattern)![1]);
      const originalSource = content.match(sourcePattern)![1];

      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
      type = type ?? originalType;

      if (originalAction === action) {
        if (originalAmount !== amount || originalType !== type) {
          if (action === 'deposita') {
            player.updateGems(originalType as keyof Gems, -originalAmount);
            player.updateGems(type as keyof Gems, amount);
          } else {
            player.updateGems(originalType as keyof Gems, originalAmount);

            if (player.gems[type as keyof Gems] < amount) {
              await interaction.editReply('Gemas insuficientes.');
              return;
            }

            player.updateGems(type as keyof Gems, -amount);
          }
        }
      } else {
        if (action === 'deposita') {
          player.updateGems(originalType as keyof Gems, originalAmount);
          player.updateGems(type as keyof Gems, amount);
        } else {
          player.updateGems(originalType as keyof Gems, -originalAmount);

          if (player.gems[type as keyof Gems] < amount) {
            await interaction.editReply('Gemas insuficientes.');
            return;
          }

          player.updateGems(type as keyof Gems, -amount);
        }
      }

      const log = gemLog(player, type as keyof Gems, action as Actions, amount, source);

      try {
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao corrigir lançamento de gemas: ${e}`)
        await interaction.editReply(`Falha ao corrigir lançamento: ${e.message}`);
      }
    }

    if (subcommand === 'xp') {
      const channel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
      const characterPattern = /Personagem: (.+)/;
      const xpPattern = /(-?\d+) (?:XP)/

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.')
        return;
      }

      if (!message.mentions.has(author)) {
        await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
        return;
      }

      const content = message.content;
      console.log(content);
      const originalAction = parseInt(content.match(xpPattern)![1]) < 0 ? 'retira' : 'deposita';
      const originalAmount = Math.abs(parseInt(content.match(xpPattern)![1]));
      const originalSource = content.match(sourcePattern)![1];
      const originalName = content.match(characterPattern)![1];

      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
      name = name ?? originalName;

      if (!player.getCharacter(originalName) || !player.getCharacter(name)) {
        await interaction.editReply('Personagem não encontrado! Utilize o comando `/personagem adicionar` para criar o personagem.');
        return;
      }

      const character = player.getCharacter(name)!;
      const originalCharacter = player.getCharacter(originalName)!;

      if (originalAction === action) {
        if (originalAmount !== amount || originalName !== name) {
          if (action === 'deposita') {
            originalCharacter.updateXp(-originalAmount);
            character.updateXp(amount);
          } else {
            originalCharacter.updateXp(originalAmount);

            if (character.xp < amount) {
              await interaction.editReply('XP não pode ficar abaixo de 0.');
              return;
            }

            character.updateXp(-amount);
          }
        }
      } else {
        if (action === 'deposita') {
          originalCharacter.updateXp(originalAmount);
          character.updateXp(amount);
        } else {
          originalCharacter.updateXp(-originalAmount);

          if (character.xp < amount) {
            await interaction.editReply('XP não pode ficar abaixo de 0.');
            return;
          }

          character.updateXp(-amount);
        }
      }

      const log = xpLog(player.id, character, action === 'retira' ? -amount : amount, source);

      try {
        if (originalName !== name) {
          const oldLog = xpLog(player.id, originalCharacter, originalAction === 'retira' ? originalAmount : -originalAmount, messageUrl);
          await channel.send(`Correção do lançamento: ${messageUrl}\n\n` + oldLog);
        }
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao corrigir lançamento de XP: ${e}`);
        await interaction.editReply(`Falha ao corrigir lançamento: ${e.message}`);
      }
    }
  }
}