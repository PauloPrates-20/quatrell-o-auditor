/* Imports */
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, TextChannel } from 'discord.js';
import { loadPlayer, updatePlayer, registerLog } from '../../lib/firebase/firestoreQuerys';
import { Character } from '../../lib/classes';
import { sourceValidation } from '../../lib/validation';
import { channels } from '../../config';
import { gainXp, looseXp } from '../../lib/controllers/xp';

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
    const xpChannel = interaction.client.channels.cache.get(channels.xp!) as TextChannel;

    if (!player) {
      await interaction.editReply('Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar.');
      return;
    }

    const character = player.getCharacter(name);

    if (subcommand === 'adicionar') {
      const newCharacter = new Character(name);

      if (character) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }

      player.addCharacter(newCharacter);

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} adicionado com sucesso.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao adicionar personagem: ${e}`);
        await interaction.editReply(`Falha ao adicionar personagem: ${e.message}`);
      }
    } else if (subcommand === 'remover') {
      player.deleteCharacter(name);

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} removido com sucesso.`);
        xpChannel.send(`Personagem ${name} de <@${author}> deletado.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao remover personagem: ${e}`)
        await interaction.editReply(`Falha ao deletar personagem: ${e.message}`);
      }
    } else if (subcommand === 'renomear') {
      const newName = interaction.options.getString('nome')!;

      if (!character) {
        await interaction.editReply('Personagem não encontrado. Utlize o comando `/listar` para conferir seus personagens.');
        return;
      }

      if (player.getCharacter(newName)) {
        await interaction.editReply('Já existe um personagem com este nome.');
        return;
      }

      const oldName = character.name;
      character.rename(newName);

      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${oldName} renomeado para ${newName}.`);
        xpChannel.send(`Personagem ${oldName} de <@${author}> renomeado para ${newName}.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao renomear personagem: ${e}`);
        await interaction.editReply(`Falha ao renomear personagem: ${e.message}`);
      }
    } else if (subcommand === 'add-xp') {
      const source = interaction.options.getString('origem')!;
      const amount = interaction.options.getInteger('xp')!;

      try {
        await gainXp(player, character, amount, source, xpChannel);
        await interaction.editReply(`${amount} XP adicionados ao personagem ${name} com sucesso.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao adicionar XP: ${e}`)
        await interaction.editReply(`Falha ao adicionar XP ao personagem: ${e.message}`);
      }
    } else if (subcommand === 'sub-xp') {
      const source = interaction.options.getString('origem')!;
      const amount = interaction.options.getInteger('xp')!;

      try {
        await looseXp(player, character, amount, source, xpChannel);
        await interaction.editReply(`${amount} XP subtraídos do personagem ${name} com sucesso.`);
      } catch (e: any) {
        console.error(`[ERROR] Falha ao subtrair XP: ${e}`);
        await interaction.editReply(`Falha ao subtrair XP do personagem: ${e.message}`);
      }
    }
  },
};