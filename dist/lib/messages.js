"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/messages.ts
var messages_exports = {};
__export(messages_exports, {
  gemLogBuilder: () => gemLogBuilder,
  goldLogBuilder: () => goldLogBuilder,
  purchaseLogBuilder: () => purchaseLogBuilder,
  transferencyLogBuilder: () => transferencyLogBuilder,
  vendingLogBuilder: () => vendingLogBuilder,
  xpLogBuilder: () => xpLogBuilder
});
module.exports = __toCommonJS(messages_exports);
function goldLogBuilder(player, action, amount, source) {
  const actionText = { retira: "Retira", deposita: "Deposita" };
  const message = `Jogador: <@${player.id}>
${actionText[action]}: ${amount} PO
Ouro Total: ${player.gold} PO
Origem: ${source}`;
  return message;
}
function xpLogBuilder(player, characterKey, amount, source) {
  const character = player.characters[characterKey];
  const message = `Jogador: <@${player.id}>
Personagem: ${character.name}
Ganho de Experi\xEAncia: ${amount} XP
Experi\xEAncia Acumulada: ${character.xp} XP
N\xEDvel Atual: ${character.level}
Tier Atual: ${character.tier}
Origem: ${source}`;
  return message;
}
function gemLogBuilder(player, type, amount, action, source) {
  const types = { comum: "Comum", transmutacao: "da Transmuta\xE7\xE3o", ressureicao: "da Ressurei\xE7\xE3o" };
  const actions = { retira: "Retira", deposita: "Deposita" };
  const actionType = actions[action];
  const gemType = types[type];
  const message = `Jogador: <@${player.id}>
${actionType}: ${amount} Gema(s) ${gemType}
Total: ${player.gems.comum} Gema(s) Comum, ${player.gems.transmutacao} Gema(s) da Transmuta\xE7\xE3o, ${player.gems.ressureicao} Gema(s) da Ressurei\xE7\xE3o
Origem: ${source}`;
  return message;
}
function transferencyLogBuilder(type, targets, amount, gemType) {
  const gemTypes = { comum: "Comum", transmutacao: "da Transmuta\xE7\xE3o", ressureicao: "da Ressurei\xE7\xE3o" };
  let currencyText = "PO";
  if (type === "gema") {
    const gem = gemTypes[gemType];
    currencyText = `Gema(s) ${gem}`;
  }
  const message = `Jogador: <@${targets[0]}>
Transfere: ${amount} ${currencyText}
Para: <@${targets[1]}>`;
  return message;
}
function purchaseLogBuilder(target, character, item, amount, price) {
  const message = `Jogador: <@${target}>
Personagem: ${character.name}
Compra: ${amount}x ${item}
Valor: ${price} PO`;
  return message;
}
function vendingLogBuilder(target, character, item, amount, price) {
  const message = `Jogador: <@${target}>
Personagem: ${character.name}
Vende: ${amount}x ${item}
Valor: ${price} PO`;
  return message;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  gemLogBuilder,
  goldLogBuilder,
  purchaseLogBuilder,
  transferencyLogBuilder,
  vendingLogBuilder,
  xpLogBuilder
});
