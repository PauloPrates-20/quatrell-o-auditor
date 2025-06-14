import { Character, Player } from '../classes';
import { endTransaction } from '../utils';
import { TextChannel } from 'discord.js';
import { assertPositive, characterValidation, enoughCurrencyValidation, playerValidation, runValidations, sourceValidation } from '../validation';
import { xpLog } from '../messages';

export async function gainXp(player: Player | undefined, character: Character | undefined, amount: number, source: string, channel: TextChannel, validateSource = true) {
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    characterValidation(character),
    validateSource ? sourceValidation(source) : true,
  );

  character!.updateXp(amount);
  const log = xpLog(player!.id, character!, amount, source)

  await endTransaction(player!, log, channel);
}

export async function looseXp(player: Player | undefined, character: Character | undefined, amount: number, source: string, channel: TextChannel, validateSource = true) {
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    characterValidation(character),
    enoughCurrencyValidation(character!.xp, amount),
    validateSource ? sourceValidation(source) : true,
  );

  character!.updateXp(-amount);
  const log = xpLog(player!.id, character!, -amount, source)

  await endTransaction(player!, log, channel);
}

export async function setXp(author: string, player: Player | undefined, character: Character | undefined, amount: number, channel: TextChannel) {
  // validation block
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    characterValidation(character),
  );

  character!.updateXp(amount, true);

  await endTransaction(player!, `XP do personagem ${character!.name} de <@${player!.id}> ajustado para ${amount} por <@${author}>!`, channel, false);
}