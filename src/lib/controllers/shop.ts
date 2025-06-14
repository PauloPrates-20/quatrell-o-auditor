import { TextChannel } from "discord.js";
import { Character, Player } from "../classes";
import { Item } from "../definitions";
import { assertPositive, characterValidation, enoughCurrencyValidation, playerValidation, runValidations } from "../validation";
import { purchaseLog, vendingLog } from "../messages";
import { depositGold, withdrawGold } from "./bank";

export async function purchaseItem(player: Player | undefined, character: Character | undefined, item: Item, amount: number, shopChannel: TextChannel, bankChannel: TextChannel) {
  runValidations(
    playerValidation(player),
    assertPositive(item.price),
    enoughCurrencyValidation(player!.gold, item.price),
    characterValidation(character,)
  );
  
  const source = (await shopChannel.send(purchaseLog(player!.id, character!.name, item.name, amount, item.price))).url;

  withdrawGold(player, item.price, source, bankChannel);
}

export async function sellItem(player: Player | undefined, character: Character | undefined, item: Item, amount: number, shopChannel: TextChannel, bankChannel: TextChannel) {
  runValidations(
    playerValidation(player),
    assertPositive(item.price),
    characterValidation(character,)
  );
  
  const source = (await shopChannel.send(vendingLog(player!.id, character!.name, item.name, amount, item.price))).url;

  depositGold(player, item.price, source, bankChannel);
}