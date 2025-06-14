import { Player } from '../classes';
import { endTransaction } from '../utils';
import { TextChannel } from 'discord.js';
import { assertPositive, enoughCurrencyValidation, playerValidation, runValidations, sourceValidation, targetValidation } from '../validation';
import { bankLog, transferencyLog } from '../messages';

export async function depositGold(player: Player | undefined, amount: number, source: string, channel: TextChannel, validateSource = true) {
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    validateSource ? sourceValidation(source) : true,
  );

  player!.updateGold(amount);
  const log = bankLog(player!, 'deposita', amount, source);

  await endTransaction(player!, log, channel);
}

export async function withdrawGold(player: Player | undefined, amount: number, source: string, channel: TextChannel) {
  runValidations(
    playerValidation(player),
    assertPositive(amount),
    sourceValidation(source),
    enoughCurrencyValidation(player!.gold, amount),
  );

  player!.updateGold(-amount);
  const log = bankLog(player!, 'retira', amount, source);

  await endTransaction(player!, log, channel);
}

export async function setGold(author: string, player: Player | undefined, amount: number, channel: TextChannel) {
  // validation block
  runValidations(
    playerValidation(player),
    assertPositive(amount),
  );

  player!.updateGold(amount, true);

  endTransaction(player!, `Ouro de <@${player!.id}> ajustado para ${amount} PO por <@${author}>!`, channel, false);
}

export async function transferGold(author: Player | undefined, target: Player | undefined, amount: number, transferChannel: TextChannel, bankChannel: TextChannel) {
  // validation block
  runValidations(
    playerValidation(author),
    targetValidation(target),
    assertPositive(amount),
    enoughCurrencyValidation(author!.gold, amount)
  );

  const transferLog = transferencyLog(author!.id, target!.id, 'gold', amount);
  const source = (await transferChannel.send(transferLog)).url;

  withdrawGold(author, amount, source, bankChannel);
  depositGold(target, amount, source, bankChannel);
}