import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'

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
    }
}