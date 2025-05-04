/* Imports */
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { loadPlayer } from '../../lib/firebase/firestoreQuerys';
import { CharacterDef, Gems } from '../../lib/definitions';
import { Validator } from '../../lib/controllers/validator';
import { BankController, TreasureController, XpController } from '../../lib/controllers/currency';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajustar')
    .setDescription('Ajusta os valores de ouro, gemas ou XP de um jogador.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Ajusta o valor de ouro do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro do jogador após o ajuste.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Ajusta a quantidade de gemas do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a ajustar.')
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
            .setDescription('Quantidade de gemas do jogador após o ajuste.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('xp')
        .setDescription('Ajusta o valor de XP de um personagem do jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador a editar.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem a editar.')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Quantidade de XP do personagem após o ajuste.')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('jogador')!.id;
    const author = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(target);
    const amount = (
      interaction.options.getInteger('ouro') ?? 
      interaction.options.getInteger('gemas') ?? 
      interaction.options.getInteger('xp')
    )!;
    const characterName = interaction.options.getString('personagem');
    const character = player?.characters?.find((char) => char.name === characterName);

    const valid = await Validator.inputs(
      [
        { type: 'player', value: player },
        { type: 'currency', value: amount },
        { type: 'character', value: character },
      ],
      interaction
    );

    if (!valid) return;

    if (subcommand === 'ouro') {
      BankController.setGold(author, player!, amount, interaction);
    } else if (subcommand === 'gema') {
      const key = interaction.options.getString('tipo') as keyof Gems;

      TreasureController.setGems(author, player!, amount, key, interaction);
    } else if (subcommand === 'xp') {
      const character = player!.getCharacter(interaction.options.getString('personagem')!);

      const isValid = Validator.inputs([ { type: 'character', value: character }], interaction);

      if (!isValid) return;

      XpController.setXp(author, player!, amount, character as CharacterDef, interaction);
    }
  },
};