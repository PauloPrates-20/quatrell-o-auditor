import { Player } from './classes';
import { Gems, Actions } from './definitions';

// Builds the messages used for the logs in the channel #banco
export function goldLogBuilder(player: Player, action: Actions, amount: number, source: string) {
  const actionText = { retira: 'Retira', deposita: 'Deposita' };
  const message = `Jogador: <@${player.id}>\n${actionText[action]}: ${amount} PO\nOuro Total: ${player.gold} PO\nOrigem: ${source}`;

  return message;
}

// Builds the messages used for the logs in the channel #fonte-da-experiência
export function xpLogBuilder(player: Player, characterKey: string, amount: number, source: string) {
  const character = player.characters[characterKey];
  const message = `Jogador: <@${player.id}>\nPersonagem: ${character.name}\nGanho de Experiência: ${amount} XP\nExperiência Acumulada: ${character.xp} XP\nNível Atual: ${character.level}\nTier Atual: ${character.tier}\nOrigem: ${source}`;

  return message;
}

// Builds the messages used for the logs in the channel #tesouros-e-gemas
export function gemLogBuilder(player: Player, type: keyof Gems, amount: number, action: Actions, source: string) {
  const types = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
  const actions = { retira: 'Retira', deposita: 'Deposita' };
  const actionType = actions[action];
  const gemType = types[type];
  const message = `Jogador: <@${player.id}>\n${actionType}: ${amount} Gema(s) ${gemType}\nTotal: ${player.gems.comum} Gema(s) Comum, ${player.gems.transmutacao} Gema(s) da Transmutação, ${player.gems.ressureicao} Gema(s) da Ressureição\nOrigem: ${source}`;

  return message;
}

// Builds the messages for logs used in the channel #transferências-entre-jogadores
export function transferencyLogBuilder(type: string, targets: string[], amount: number, gemType?: keyof Gems) {
  const gemTypes = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
  let currencyText = 'PO';

  if (type === 'gema') {
    const gem = gemTypes[gemType!];
    currencyText = `Gema(s) ${gem}`;
  }

  const message = `Jogador: <@${targets[0]}>\nTransfere: ${amount} ${currencyText}\nPara: <@${targets[1]}>`;

  return message;
}

export function purchaseLogBuilder(target: string, item: string, amount: number, price: number) {
  const message = `Jogador: <@${target}>\nCompra: ${amount}x ${item}\nValor: ${price} PO`;

  return message;
}