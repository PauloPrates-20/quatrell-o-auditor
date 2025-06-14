import { Character, Player } from './classes';
import { Gems, Actions } from './definitions';
import { GemTypes } from './tables';

const actions = { retira: 'Retira', deposita: 'Deposita' };
// Builds the messages used for the logs in the channel #banco
export function bankLog(player: Player, action: Actions, amount: number, source: string) {
  return `Jogador: <@${player.id}>\n${actions[action]}: ${amount} PO\nOuro Total: ${player.gold} PO\nOrigem: ${source}`;
}

// Builds the messages used for the logs in the channel #fonte-da-experiência
export function xpLog(target: string, character: Character, amount: number, source: string) {
  return `Jogador: <@${target}>\nPersonagem: ${character.name}\nGanho de Experiência: ${amount} XP\nExperiência Acumulada: ${character.xp} XP\nNível Atual: ${character.level}\nTier Atual: ${character.tier}\nOrigem: ${source}`;
}

// Builds the messages used for the logs in the channel #tesouros-e-gemas
export function gemLog(player: Player, type: keyof Gems, action: Actions, amount: number, source: string) {
  return `Jogador: <@${player.id}>\n${actions[action]}: ${amount} Gema(s) ${GemTypes[type]}\nTotal: ${player.gems.comum} Gema(s) Comum, ${player.gems.transmutacao} Gema(s) da Transmutação, ${player.gems.ressureicao} Gema(s) da Ressureição\nOrigem: ${source}`;
}

// Builds the messages for logs used in the channel #transferências-entre-jogadores
export function transferencyLog(author: string, target: string, type: string, amount: number, gemType?: keyof Gems) {
  return `Jogador: <@${author}>\nTransfere: ${amount}${gemType ? `x ${GemTypes[gemType]}` : ' PO'}\nPara: <@${target}>`;
}

export function purchaseLog(target: string, character: string, item: string, amount: number, price: number) {
  return `Jogador: <@${target}>\nPersonagem: ${character}\nCompra: ${amount}x ${item}\nValor: ${price} PO`;
}

export function vendingLog(target: string, character: string, item: string, amount: number, price: number) {
  return `Jogador: <@${target}>\nPersonagem: ${character}\nVende: ${amount}x ${item}\nValor: ${price} PO`;
}