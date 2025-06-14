import { Character, Player } from '../classes';
import { TextChannel } from 'discord.js';
import { assertPositive, characterValidation, playerValidation, sourceValidation } from '../validation';
import { registerLog, updatePlayer } from '../firebase/firestoreQuerys';
import { xpLog } from '../messages';

export async function setXp(author: string, player: Player | undefined, character: Character | undefined, amount: number, channel: TextChannel) {
  // validation block
  let validation = playerValidation(player);
  validation = assertPositive(amount);
  validation = characterValidation(character)

  if (typeof validation === 'string') throw new Error(validation);

  character!.updateXp(amount, true);

  await updatePlayer(player!);
  await channel.send(`XP do personagem ${character!.name} de <@${player!.id}> ajustado para ${amount} por <@${author}>!`);
}