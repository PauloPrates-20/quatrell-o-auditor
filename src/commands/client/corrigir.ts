import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { channels } from '../../config';
import { loadPlayer } from "../../lib/firebase/firestoreQuerys";
import { sourceValidation } from "../../lib/validation";
import { Sanitizer } from "../../lib/classes";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('corrigir')
    .setDescription('Corrige lançamentos errados.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Corrige um lançamento de ouro do jogador.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('URL apontando para a mensagem a corrigir.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade correta de ouro para o lançamento.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a origem do ouro.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Corrige um lançamento de gemas do jogador.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('URL apontando para a mensagem a corrigir.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('gemas')
            .setDescription('Quantidade correta de gemas para o lançamento.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a origem das gemas.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('xp')
        .setDescription('Corrige um lançamento XP do jogador.')
        .addStringOption(option =>
          option
            .setName('mensagem')
            .setDescription('URL apontando para a mensagem a corrigir.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Quantidade correta de XP para o lançamento.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a origem das gemas.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const amount = (
      interaction.options.getInteger('ouro') ??
      interaction.options.getInteger('gemas') ??
      interaction.options.getInteger('xp')
    )!;
    const player = loadPlayer(author);
    const source = interaction.options.getString('origem')!;
    const messageUrl = interaction.options.getString('mensagem')!
    const clientGuild = interaction.guild!.id;
    const [guildId, channelId, messageId] = Sanitizer.urlComponents(messageUrl);
    const subcommand = interaction.options.getSubcommand();
    const baseURl = `https://discord.com/${clientGuild}`;

    if (!sourceValidation(source)) {
      await interaction.editReply('Origem inválida.');
      return;
    }

    if (!sourceValidation(messageUrl)) {
      await interaction.editReply('Mensagem inválida.');
      return;
    }

    if (guildId !== clientGuild) {
      await interaction.editReply('Mensagem inválida: selecione uma mensagem neste servidor.');
      return;
    }

    if (!player) {
      await interaction.editReply('Jogador não encontrado. Utilize `/registrar` para se cadastrar.');
      return;
    }

    // Subcommand handling
    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

      // checks if the message channel is correct
      if (channelId !== bankChannel.id) {
        await interaction.editReply(`Mensagem inválida: selecione uma mensagem do canal ${baseURl}/${bankChannel.id}`);
      }

      // fetch the message and checks if it was found
      const message = await bankChannel.messages.fetch(messageId!);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.');
        return;
      }
    }

    if (subcommand === 'gema') {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;

      // checks if the message channel is correct
      if (channelId !== treasureChannel.id) {
        await interaction.editReply(`Mensagem inválida: selecione uma mensagem do canal ${baseURl}/${treasureChannel.id}`);
      }

      // fetch the message and checks if it was found
      const message = await treasureChannel.messages.fetch(messageId!);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.');
        return;
      }
    }

    if (subcommand === 'xp') {
      const xpChannel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

      // checks if the message channel is correct
      if (channelId !== xpChannel.id) {
        await interaction.editReply(`Mensagem inválida: selecione uma mensagem do canal ${baseURl}/${xpChannel.id}`);
      }

      // fetch the message and checks if it was found
      const message = await xpChannel.messages.fetch(messageId!);

      if (!message) {
        await interaction.editReply('Mensagem não encontrada.');
        return;
      }
    }
  },
}