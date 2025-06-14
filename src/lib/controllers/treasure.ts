import { Player } from '../classes';
import { TextChannel } from 'discord.js';
import { endTransaction } from '../utils';
import { assertPositive, playerValidation, targetValidation, sourceValidation, enoughCurrencyValidation, runValidations } from '../validation';
import { Gems } from '../definitions';
import { GemTypes } from '../tables';
import { gemLog, transferencyLog } from '../messages';

export async function depositGem(player: Player | undefined, type: keyof Gems, amount: number, source: string, channel: TextChannel, validateSource = true) {
  // Validation block
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    validateSource ? sourceValidation(source) : true,
  );

  player!.updateGold(amount);
  const log = gemLog(player!, type, 'deposita', amount, source);

  await endTransaction(player!, log, channel);
}

export async function withdrawGem(player: Player | undefined, type: keyof Gems, amount: number, source: string, channel: TextChannel) {
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    sourceValidation(source),
    enoughCurrencyValidation(player!.gold, amount),
  );

  player!.updateGems(type, -amount);
  const log = gemLog(player!, type, 'retira', amount, source);

  await endTransaction(player!, log, channel);
}

export async function setGem(author: string, player: Player | undefined, type: keyof Gems, amount: number, channel: TextChannel) {
  // validation block
  runValidations(
    playerValidation(player),
    assertPositive(amount),
  );

  player!.updateGems(type, amount, true);

  await endTransaction(player!, `Gemas ${GemTypes[type]} de <@${player!.id}> ajustadas para ${amount} por <@${author}>!`, channel, false);
}

export async function transferGem(author: Player | undefined, target: Player | undefined, type: keyof Gems, amount: number, transferChannel: TextChannel, treasureChannel: TextChannel) {
  // validation block
  runValidations(
    playerValidation(author),
    targetValidation(target),
    assertPositive(amount),
    enoughCurrencyValidation(author!.gems[type], amount)
  );

  const transferLog = transferencyLog(author!.id, target!.id, 'gem', amount);
  const source = (await transferChannel.send(transferLog)).url;

  withdrawGem(author, type, amount, source, treasureChannel);
  depositGem(target, type, amount, source, treasureChannel);
}