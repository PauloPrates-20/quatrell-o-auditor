/* Imports */
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { Gems } from '../../lib/definitions';
import { BankController, TreasureController } from '../../lib/controllers/currency';
import { Validator } from '../../lib/controllers/validator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('retirar')
    .setDescription('Retira ouro ou gemas do jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Retira ouro do jogador.')
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro a retirar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica o gasto.')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('retira gemas do jogador.')
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a ser retirada.')
            .addChoices(
              { name: 'Comum', value: 'comum' },
              { name: 'Transmutação', value: 'transmutacao' },
              { name: 'Ressureição', value: 'ressureicao' },
            )
            .setRequired(true),
        )
        .addIntegerOption(option =>
          option
            .setName('gemas')
            .setDescription('Quantidade de gemas a retirar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a retirada das gemas.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const source = interaction.options.getString('origem')!;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(author);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    const valid = await Validator.inputs(
      [
        { type: 'player', value: player },
        { type: 'source', value: source },
        { type: 'currency', value: amount },
      ],
      interaction
    );

    if (!valid) return;

    if (subcommand === 'ouro') {
      await BankController.withdraw(player!, amount, source, interaction)
    } else if (subcommand === 'gema') {
      const key = interaction.options.getString('tipo') as keyof Gems;

      await TreasureController.withdraw(player!, amount, key, source, interaction);
    }
  },
};