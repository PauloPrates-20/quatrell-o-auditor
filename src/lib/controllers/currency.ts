import { Player } from '../classes/player';
import { Log } from '../classes/log';
import { channels } from '../../config';
import { registerLog, updatePlayer } from '../firebase/firestoreQuerys';
import { gemLogBuilder, goldLogBuilder, transferencyLogBuilder } from '../messages';
import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Gems } from '../definitions';
import { GemTypes } from '../tables';

export class BankController {
  static async deposit(player: Player, amount: number, source: string, interaction: ChatInputCommandInteraction) {
    player.changeGold(amount);
    const channel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const log = new Log('gold', player.id, channel.id, goldLogBuilder(player, 'deposita', amount, source))

    try {
      await Promise.all([
        updatePlayer(player),
        registerLog(log, player.id),
        interaction.editReply(`${amount} PO adicionados com sucesso.`),
        channel.send(log.content),
      ]);
    } catch (e: any) {
      await interaction.editReply(`Falha ao depositar ouro: ${e.message}`)
      console.error(`${e.message}`)
    }
  }

  static async withdraw(player: Player, amount: number, source: string, interaction: ChatInputCommandInteraction) {
    player.changeGold(-amount);
    const channel = interaction.client.channels.cache.get(channels.bank!) as TextChannel;
    const log = new Log('gold', player.id, channel.id, goldLogBuilder(player, 'retira', amount, source));

    if (player.gold < amount) {
      await interaction.editReply('Ouro insuficiente!');
      return;
    }

    try {
      Promise.all([
        updatePlayer(player),
        registerLog(log, player.id),
        interaction.editReply(`${amount} PO retirados com sucesso.`),
        channel.send(log.content),
      ]);
    } catch (e: any) {
      await interaction.editReply(`Falha ao retirar ouro: ${e.message}`);
      console.error(e.message);
    }
  }

  static async transfer(player: Player, target: Player, amount: number, source: string, interaction: ChatInputCommandInteraction) {
    const channel = interaction.client.channels.cache.get(channels.transferencies!) as TextChannel;
    const log = new Log('transferency', [player.id, target.id], channel.id, transferencyLogBuilder('gold', [player.id, target.id], amount));

    try {
      const message = await channel.send(log.content);
      const source = message.url;

      await this.withdraw(player, amount, source, interaction);
      await this.deposit(target, amount, source, interaction);
      
      Promise.all([
        registerLog(log, player.id),
        registerLog(log, target.id),
        interaction.editReply(`${amount} PO transferidos para <@${target}>.`),
      ]);
    } catch (e: any) {
      await interaction.editReply(`Falha ao realizar transferência: ${e.message}`);
      console.error(e.message);
    }
  }
}

export class TreasureController {
  static async deposit(player: Player, key: keyof Gems, amount: number, source: string, interaction: ChatInputCommandInteraction) {
    player.changeGems(key, amount);
    const channel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
    const log = new Log('gem', player.id, channel.id, gemLogBuilder(player, key, amount, 'deposita', source));

    try {
      await Promise.all([
        updatePlayer(player),
        registerLog(log, player.id),
        interaction.editReply(`${amount} Gema(s) ${GemTypes[key as keyof Gems]} adicionada(s) com sucesso.`),
        channel.send(log.content),
      ]);
    } catch (e: any) {
      await interaction.editReply(`Falha ao depositar gemas: ${e.message}`);
      console.error(e.message);
    }
  }

  static async withdraw(player: Player, amount: number, key: keyof Gems, source: string, interaction: ChatInputCommandInteraction) {
    player.changeGems(key, -amount);
    const channel = interaction.client.channels.cache.get(channels.treasure!) as TextChannel;
    const log = new Log('gold', player.id, channel.id, gemLogBuilder(player, key, amount, 'retira', source));

    if (player.gems[key] < amount) {
      await interaction.editReply('Gemas insuficientes!');
      return;
    }

    try {
      Promise.all([
        updatePlayer(player),
        registerLog(log, player.id),
        interaction.editReply(`${amount} Gema(s) ${GemTypes[key]} retirada(s) com sucesso.`),
        channel.send(log.content),
      ]);
    } catch (e: any) {
      await interaction.editReply(`Falha ao retirar gemas: ${e.message}`);
      console.error(e.message);
    }
  }
}