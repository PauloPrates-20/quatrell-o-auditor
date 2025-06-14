import { Player } from '../classes';
import { TextChannel } from 'discord.js';
import { assertPositive, playerValidation, sourceValidation } from '../validation';
import { registerLog, updatePlayer } from '../firebase/firestoreQuerys';
import { bankLog } from '../messages';

export async function depositGold(player: Player | undefined, amount: number, source: string, channel: TextChannel, reward = false) {
  // Validation block
  let validation = playerValidation(player);
  validation = assertPositive(amount);
  if (!reward) validation = sourceValidation(source);

  if (typeof validation === 'string') throw new Error(validation);

  player!.updateGold(amount);
  const log = bankLog(player!, 'deposita', amount, source);

  await updatePlayer(player!);
  await registerLog(log, player!.id);
  await channel.send(`${amount} PO despositado(s) com sucesso!`);
}

export async function setGold(author: string, player: Player | undefined, amount: number, channel: TextChannel) {
  // validation block
  let validation = playerValidation(player);
  validation = assertPositive(amount);

  if (typeof validation === 'string') throw new Error(validation);

  player!.updateGold(amount, true);

  await updatePlayer(player!);
  await channel.send(`Ouro de <@${player!.id}> ajustado para ${amount} PO por <@${author}>!`);
}