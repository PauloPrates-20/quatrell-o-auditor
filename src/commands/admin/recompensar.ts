/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { Gems } from '../../lib/definitions';
import { Validator } from '../../lib/controllers/validator';
import { BankController, TreasureController } from '../../lib/controllers/currency';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recompensar')
    .setDescription('Deposita recompensas de doações para os jogadores.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Deposita a recompensa em ouro das doações.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a receber a recompensa.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro a depositar.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Deposita a recompensa em gemas das doações.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a receber a recompensa.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a depositar.')
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
            .setDescription('Quantidade de gemas a depositar.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('jogador')!.id;
    const subcommand = interaction.options.getSubcommand();
    const source = 'Recompensa por doação ao servidor.';
    const player = await loadPlayer(target);
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!

    const valid = await Validator.inputs(
      [
        { type: 'player', value: player },
        { type: 'currency', value: amount },
      ],
      interaction
    );

    if (!valid) return;

    if (subcommand === 'ouro') {
      BankController.deposit(player!, amount, source, interaction)
    } else if (subcommand === 'gema') {
      const key = interaction.options.getString('tipo') as keyof Gems;

      TreasureController.deposit(player!, key, amount, source, interaction);
    }
  },
};