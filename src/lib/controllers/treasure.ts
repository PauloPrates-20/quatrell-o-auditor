import { Player } from '../classes';
import { TextChannel } from 'discord.js';
import { assertPositive, playerValidation, sourceValidation } from '../validation';
import { updatePlayer, registerLog } from '../firebase/firestoreQuerys';
import { Gems } from '../definitions';
import { GemTypes } from '../tables';
import { gemLog } from '../messages';

export async function depositGem(player: Player | undefined, type: keyof Gems, amount: number, source: string, channel: TextChannel, reward = false) {
  // Validation block
  let validation = playerValidation(player);
  validation = assertPositive(amount);
  if (!reward) validation = sourceValidation(source);

  if (typeof validation === 'string') throw new Error(validation);

  player!.updateGold(amount);
  const log = gemLog(player!, type, 'deposita', amount, source);

  await updatePlayer(player!);
  await registerLog(log, player!.id);
  await channel.send(`${amount} PO despositado(s) com sucesso!`);
}

export async function setGem(author: string, player: Player | undefined, type: keyof Gems, amount: number, channel: TextChannel) {
  // validation block
  let validation = playerValidation(player);
  validation = assertPositive(amount);

  if (typeof validation === 'string') throw new Error(validation);

  player!.updateGems(type, amount, true);

  await updatePlayer(player!);
  await channel.send(`Gemas ${GemTypes[type]} de <@${player!.id}> ajustadas para ${amount} por <@${author}>!`);
}