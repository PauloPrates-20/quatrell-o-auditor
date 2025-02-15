import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, Message } from 'discord.js'
import { channels } from '../../config';
import { sourceValidation } from '../../lib/validation';
import { Sanitizer } from '../../lib/classes';

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
      const messageUrl = interaction.options.getString('mensagem', true);
      const baseUrl = `https://discord.com/channels/${clientGuild}`;

      if (!sourceValidation(messageUrl)) {
        await interaction.editReply('Mensagem inválida.');
        return;
      }

      const [messageGuild, messageChannel, messageId] = Sanitizer.urlComponents(messageUrl);

      if (messageGuild !== clientGuild) {
        await interaction.editReply('Mensagem inválida. Selecione uma mensagem neste servidor.');
        return;
      }

      let channel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
      // subcommand handling
      if (subcommand === 'ouro') {
      }

      if (subcommand === 'gema') {
        channel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
      }

      if (subcommand === 'xp') {
        channel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;
      }

      if (messageChannel !== channel.id) {
        await interaction.editReply(`Mensagem inválida. Selecione uma mensagem em ${baseUrl}/${channel.id}`);
        return;
      }

      const message = await channel.messages.fetch(messageId!);
      
      if (!message) {
        await interaction.editReply('Mensagem não encontrada.')
        return;
      }

      if (!message.mentions.has(author)) {
        await interaction.editReply('Só é possível corrigir os próprios lançamentos.');
        return;
      }
    }
}