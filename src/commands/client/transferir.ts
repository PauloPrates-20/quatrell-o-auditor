/* Imports */
import { TextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Log } from '../../lib/classes';
import { goldLogBuilder, gemLogBuilder, transferencyLogBuilder } from '../../lib/messages';
import { channels } from '../../config';
import { Gems } from '../../lib/definitions';
import { GemTypes } from '../../lib/tables';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transferir')
    .setDescription('Transfere ouro ou gemas para outro jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ouro')
        .setDescription('Transfere ouro para outro jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador que vai receber a transferência.')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('ouro')
            .setDescription('Quantidade de ouro para transferir')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('gema')
        .setDescription('Transfere gemas para outro jogador.')
        .addUserOption(option =>
          option
            .setName('jogador')
            .setDescription('Jogador que vai receber a transferência.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('tipo')
            .setDescription('Tipo de gema a transferir.')
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
            .setDescription('Quantidade de gemas a transferir')
            .setRequired(true)
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: 'Ephemeral' });

    const author = interaction.user.id;
    const target = interaction.options.getUser('jogador')!.id;
    const amount = (interaction.options.getInteger('ouro') ?? interaction.options.getInteger('gemas'))!;

    if (author === target) {
      await interaction.editReply('Não é possível transferir para si mesmo.');
      return;
    }

    const transferencyChannel = interaction.client.channels.cache.get(channels.transferencies!) as TextChannel;
    const [authorPlayer, targetPlayer] = await Promise.all([loadPlayer(author), loadPlayer(target)]);
    const subcommand = interaction.options.getSubcommand();

    if (!authorPlayer) {
      await interaction.editReply('Jogador não encontrado. Utilize `/registrar` para se cadastrar.');
      return;
    }
    if (!targetPlayer) {
      await interaction.editReply('Jogador alvo não encontado.');
      return;
    }

    if (subcommand === 'ouro') {
      const bankChannel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;

      if (authorPlayer.gold < amount) {
        await interaction.editReply('Ouro insuficiente.');
        return;
      }

      const transferencyLog = new Log('transferencia', [author, target], transferencyChannel.id, transferencyLogBuilder('ouro', [author, target], amount));
      const sourceMessage = await transferencyChannel!.send(transferencyLog.content);
      const source = sourceMessage.url;

      authorPlayer.subGold(amount);
      targetPlayer.addGold(amount);

      const authorLog = new Log('ouro', author, bankChannel.id, goldLogBuilder(authorPlayer, 'retira', amount, source));
      const targetLog = new Log('ouro', target, bankChannel.id, goldLogBuilder(targetPlayer, 'deposita', amount, source));

      bankChannel.send(authorLog.content);
      bankChannel.send(targetLog.content);

      try {
        await Promise.all(
          [
            updatePlayer(authorPlayer),
            registerLog(authorLog, author),
            updatePlayer(targetPlayer),
            registerLog(targetLog, target),
          ],
        );
        await interaction.editReply(`${amount} PO transferidos para <@${target}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao realizar transferência: ${error}`);
      }
    } else if (subcommand === 'gema') {
      const gemType = interaction.options.getString('tipo') as keyof Gems;
      const amount = interaction.options.getInteger('gemas')!;
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;

      if (authorPlayer.gems[gemType] < amount) {
        await interaction.editReply('Gemas insuficientes');
        return;
      }

      const transferencyLog = new Log('transferencia', [author, target], transferencyChannel.id, transferencyLogBuilder('gema', [author, target], amount, gemType));
      const sourceMessage = await transferencyChannel.send(transferencyLog.content);
      const source = sourceMessage.url;

      authorPlayer.subGems(gemType, amount);
      targetPlayer.addGems(gemType, amount);

      const authorLog = new Log('gema', author, treasureChannel.id, gemLogBuilder(authorPlayer, gemType, amount, 'retira', source));
      const targetLog = new Log('gema', target, treasureChannel.id, gemLogBuilder(targetPlayer, gemType, amount, 'deposita', source));

      treasureChannel.send(authorLog.content);
      treasureChannel.send(targetLog.content);

      try {
        await Promise.all(
          [
            updatePlayer(authorPlayer),
            registerLog(authorLog, author),
            updatePlayer(targetPlayer),
            registerLog(targetLog, target),
          ],
        );
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[gemType]} transferidas para <@${target}>.`);
      } catch (error) {
        await interaction.editReply(`Falha ao realizar transferência: ${error}`);
      }
    }
  },
};