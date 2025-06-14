import { TextChannel } from 'discord.js';
import { Player } from './classes';
import { updatePlayer, registerLog } from './firebase/firestoreQuerys';

export async function endTransaction(player: Player, log: string, channel: TextChannel, saveLog = true) {
  await Promise.all([
    await updatePlayer(player),
    saveLog ? await registerLog(log, player.id) : undefined,
    await channel.send(log),
  ]);
}

export function getUrlComponents(url: string): string[] {
  const components = url.match(/\d{18,}/g);
  const [guildId, channelId, messageId] = components!;

  return [guildId, channelId, messageId];
}

export function getGemType(input: string) { return input.normalize('NFD').replace(/\W/g, '').toLowerCase(); }