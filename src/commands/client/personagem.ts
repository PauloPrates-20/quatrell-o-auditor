/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character, Log, Sanitizer } from '../../lib/classes';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { xpLogBuilder } from '../../lib/messages';

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
    const { name, key } = Sanitizer.character(interaction.options.getString('personagem')!);
    const xpChannel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

    if (!player) {
      await interaction.editReply('Jogador não cadastrado. Utilize `/registrar` para se cadastrar.');
      return;
    }
    if (/\d/.test(name.charAt(0))) {
      await interaction.editReply('O nome do personagem não pode começar com números.');
      return;
    }
    
    if (subcommand === 'adicionar') {
      const character = new Character(name);

      if (player.characters[key]) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }
      player.registerCharacter(character, key);

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} adicionado com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao adicionar personagem: ${error}`);
      }
    } else if (subcommand === 'remover') {
      if (!player.characters[key]) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }
      player.deleteCharacter(key);

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} removido com sucesso.`);
        xpChannel.send(`Personagem ${name} de <@${(interaction.member as GuildMember).id}> deletado.`);
      } catch (error) {
        await interaction.editReply(`Falha ao deletar personagem: ${error}`);
      }
    } else if (subcommand === 'renomear') {
      const {name: newName, key: newKey } = Sanitizer.character(interaction.options.getString('nome')!);

      if (/\d/.test(newName.charAt(0))) {
        await interaction.editReply('O nome do personagem não pode começar com números.');
        return;
      }

      if (!player.characters[key]) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }

      if (player.characters[newKey]) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }

      const oldName = player.characters[key].name;
      player.renameCharacter(key, newKey, newName);

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