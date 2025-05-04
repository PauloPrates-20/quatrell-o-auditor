/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character } from '../../lib/classes/character';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { xpLogBuilder } from '../../lib/messages';
import { Validator } from '../../lib/controllers/validator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('personagem')
    .setDescription('Conjunto de comandos relacionados aos personagens do jogador.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('adicionar')
        .setDescription('Adiciona um novo personagem à lista de personagens do jogador.')
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover')
        .setDescription('Remove o personagem escolhido da lista de personagens do jogador.')
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('renomear')
        .setDescription('Renomeia um personagem, mantendo seus atributos.')
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Personagem a ser renomeado.')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option
            .setName('nome')
            .setDescription('Novo nome.')
            .setRequired(true)
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-xp')
        .setDescription('Adiciona XP ao personagem escolhido.')
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Quantidade de XP a adicionar')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica o ganho de XP.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sub-xp')
        .setDescription('Subtrai xp do personagem selecionado.')
        .addIntegerOption(option =>
          option
            .setName('xp')
            .setDescription('Quantidade de xp a subtrair')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option
            .setName('origem')
            .setDescription('URL apontando para a mensagem que justifica a retirada de XP.')
            .setRequired(true)
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const author = interaction.user.id;
    const player = await loadPlayer(author);
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString('personagem')!;
    const channel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

    const valid = Validator.inputs([{ type: 'player', value: player }], interaction);

    if (!valid) return;

    if (subcommand === 'adicionar') {
      const character = new Character(name);

      if (player!.getCharacter(name)) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }
      player!.appendCharacterList(character);

      try {
        await updatePlayer(player!);
        await interaction.editReply(`Personagem ${name} adicionado com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao adicionar personagem: ${error}`);
      }
    } else if (subcommand === 'remover') {
      if (!player!.getCharacter(name)) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }
      player!.removeCharacter(name);

      try {
        await updatePlayer(player!);
        await interaction.editReply(`Personagem ${name} removido com sucesso.`);
        channel.send(`Personagem ${name} de <@${(author)}> deletado.`);
      } catch (error) {
        await interaction.editReply(`Falha ao deletar personagem: ${error}`);
      }
    } else if (subcommand === 'renomear') {
      const newName = interaction.options.getString('nome')!;

      if (!player!.getCharacter(name)) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }

      if (player!.getCharacter(newName)) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }

      const oldName = player!.getCharacter(name)!.name;

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${oldName} renomeado para ${newName}.`);
        xpChannel.send(`Personagem ${oldName} de <@${author}> renomeado para ${newName}.`);
      } catch (error) {
        await interaction.editReply(`Falha ao renomear personagem: ${error}`);
      }
    } else if (subcommand === 'add-xp') {
      const source = interaction.options.getString('origem')!;

      if (!sourceValidation(source)) {
        interaction.editReply('Origem inválida.');
        return;
      }

      if (!player.characters[key]) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }

      const addedXp = interaction.options.getInteger('xp')!;

      player.addXp(key, addedXp);

      try {
        const log = new Log('xp', author, xpChannel.id, xpLogBuilder(player, key, addedXp, source));

        await updatePlayer(player);
        await registerLog(log, author);
        xpChannel.send(log.content);
        await interaction.editReply(`${addedXp} XP adicionados ao personagem ${name} com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao adicionar XP ao personagem: ${error}`);
      }
    } else if (subcommand === 'sub-xp') {
      const source = interaction.options.getString('origem')!;
      const removedXp = interaction.options.getInteger('xp')!;

      if (!sourceValidation(source)) {
        interaction.editReply('Origem inválida.');
        return;
      }

      if (!player.characters[key]) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }

      if (player.characters[key].xp < removedXp) {
        await interaction.editReply('XP do personagem não pode ficar abaixo de 0');
        return;
      }


      player.subXp(key, removedXp);

      try {
        const log = new Log('xp', author, xpChannel.id, xpLogBuilder(player, key, -removedXp, source));

        await updatePlayer(player);
        await registerLog(log, author);
        xpChannel.send(log.content);
        await interaction.editReply(`${removedXp} XP subtraídos do personagem ${name} com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao subtrair XP do personagem: ${error}`);
      }
    }
  },
};