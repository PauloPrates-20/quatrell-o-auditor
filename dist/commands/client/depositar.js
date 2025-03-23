"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/commands/client/depositar.ts
var import_discord = require("discord.js");

// src/lib/firebase/firestoreQuerys.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

// src/config.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  CHANNELS_BANK,
  CHANNELS_XP,
  CHANNELS_TREASURE,
  CHANNELS_TRANSFERENCIES,
  CHANNELS_GENERAL,
  CHANNELS_SHOP,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  COLLECTIONS_USERS
} = process.env;
var firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};
var collections = {
  users: COLLECTIONS_USERS
};
var channels = {
  bank: CHANNELS_BANK,
  xp: CHANNELS_XP,
  treasure: CHANNELS_TREASURE,
  transferencies: CHANNELS_TRANSFERENCIES,
  general: CHANNELS_GENERAL,
  shop: CHANNELS_SHOP
};

// src/lib/tables.ts
var levelsTable = [
  { xp: 0, level: 1 },
  { xp: 1, level: 2 },
  { xp: 2, level: 3 },
  { xp: 5, level: 4 },
  { xp: 9, level: 5 },
  { xp: 14, level: 6 },
  { xp: 20, level: 7 },
  { xp: 27, level: 8 },
  { xp: 35, level: 9 },
  { xp: 45, level: 10 },
  { xp: 56, level: 11 },
  { xp: 68, level: 12 },
  { xp: 81, level: 13 },
  { xp: 95, level: 14 },
  { xp: 110, level: 15 },
  { xp: 126, level: 16 },
  { xp: 143, level: 17 },
  { xp: 161, level: 18 },
  { xp: 180, level: 19 },
  { xp: 200, level: 20 },
  { xp: 221, level: 21 }
];
var tiersTable = [
  { level: 1, tier: "<:01_iniciante:1012215299774357504>" },
  { level: 4, tier: "<:02_cobre:1012215321421168710>" },
  { level: 7, tier: "<:03_prata:1012215335774064711>" },
  { level: 10, tier: "<:04_ouro:1012215352375115786>" },
  { level: 13, tier: "<:05_platina:1012215369710182450>" },
  { level: 16, tier: "<:06_cobalto:1012215386164428930>" },
  { level: 19, tier: "<:07_adamante:1012215399733018714>" }
];
var GemTypes = /* @__PURE__ */ ((GemTypes2) => {
  GemTypes2["comum"] = "Comum";
  GemTypes2["transmutacao"] = "da Transmuta\xE7\xE3o";
  GemTypes2["ressureicao"] = "da Ressurei\xE7\xE3o";
  return GemTypes2;
})(GemTypes || {});

// src/lib/classes.ts
var Player = class {
  constructor(id, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = {}) {
    this.id = id;
    this.gold = gold;
    this.gems = gems;
    this.characters = characters;
  }
  /* Mutation methods */
  // Adds gold to the player
  addGold(amount) {
    this.gold += amount;
  }
  // Removes gold from the player
  subGold(amount) {
    this.gold -= amount;
  }
  // Adds a character to the player
  registerCharacter(character, characterKey) {
    this.characters[characterKey] = Object.assign({}, character);
  }
  // Deletes a character from the player
  deleteCharacter(characterKey) {
    delete this.characters[characterKey];
  }
  // Renames a character (Create a new character with the same stats and delete the old)
  renameCharacter(oldKey, newKey, newName) {
    this.characters[newKey] = { ...this.characters[oldKey], name: newName };
    delete this.characters[oldKey];
  }
  // Add xp to a character
  addXp(characterKey, amount) {
    const character = this.characters[characterKey];
    character.xp += amount;
    this.changeLevel(character);
  }
  // Subtract xp from a character
  subXp(characterKey, amount) {
    const character = this.characters[characterKey];
    character.xp -= amount;
    this.changeLevel(character);
  }
  // Sets the character xp value to the amount parsed
  setXp(characterKey, amount) {
    const character = this.characters[characterKey];
    character.xp = amount;
    this.changeLevel(character);
  }
  // Changes character level
  changeLevel(character) {
    for (const level of levelsTable) {
      if (character.xp >= level.xp) {
        character.level = level.level;
      }
    }
    this.changeTier(character);
  }
  // Changes character tier
  changeTier(character) {
    for (const tier of tiersTable) {
      if (character.level >= tier.level) {
        character.tier = tier.tier;
      }
    }
  }
  // Adds gems to the player
  addGems(type, amount) {
    this.gems[type] += amount;
  }
  // Removes gems from the player
  subGems(type, amount) {
    this.gems[type] -= amount;
  }
};
var Log = class {
  constructor(type, targets, channels2, content) {
    this.type = type;
    this.targets = targets;
    this.channels = channels2;
    this.content = content;
  }
};

// src/lib/firebase/firestoreQuerys.ts
var app = (0, import_app.initializeApp)(firebaseConfig);
var db = (0, import_firestore.getFirestore)(app);
async function registerLog(logData, playerId) {
  const ref = (0, import_firestore.collection)(db, collections.users, playerId.toString(), "logs");
  const convertedLog = {
    ...logData,
    timestamp: (0, import_firestore.serverTimestamp)()
  };
  try {
    await (0, import_firestore.addDoc)(ref, convertedLog);
    console.log(`Log registered succesfully for player ${playerId}.`);
  } catch (error) {
    console.error(`Error registering log: ${error}`);
  }
}
async function loadPlayer(playerId) {
  const ref = (0, import_firestore.doc)(db, collections.users, playerId);
  try {
    const querySnapshot = await (0, import_firestore.getDoc)(ref);
    const data = querySnapshot.data();
    if (data) {
      return new Player(data.id, data.gold, data.gems, data.characters);
    } else {
      throw new Error("Player not found");
    }
  } catch (error) {
    console.error(error.message);
  }
}
async function updatePlayer(playerData) {
  const ref = (0, import_firestore.doc)(db, collections.users, playerData.id);
  const data = Object.assign({}, playerData);
  delete data.id;
  try {
    await (0, import_firestore.updateDoc)(ref, data);
    console.log(`Player ${playerData.id} updated successfuly`);
  } catch (error) {
    console.error(`Unable to update player ${playerData.id}: ${error}`);
  }
}

// src/lib/messages.ts
function goldLogBuilder(player, action, amount, source) {
  const actionText = { retira: "Retira", deposita: "Deposita" };
  const message = `Jogador: <@${player.id}>
${actionText[action]}: ${amount} PO
Ouro Total: ${player.gold} PO
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

// src/lib/validation.ts
function sourceValidation(source) {
  const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;
  return pattern.test(source);
}

// src/commands/client/depositar.ts
module.exports = {
  data: new import_discord.SlashCommandBuilder().setName("depositar").setDescription("Deposita ouro ou gemas para o jogador.").addSubcommand(
    (subcommand) => subcommand.setName("ouro").setDescription("Deposita ouro para o jogador.").addIntegerOption(
      (option) => option.setName("ouro").setDescription("Quantidade de ouro a depositar.").setRequired(true)
    ).addStringOption(
      (option) => option.setName("origem").setDescription("URL apontando para a mensagem que justifica a origem do ouro.").setRequired(true)
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("gema").setDescription("Deposita gemas para o jogador.").addStringOption(
      (option) => option.setName("tipo").setDescription("Tipo de gema a ser adicionada.").addChoices(
        { name: "Comum", value: "comum" },
        { name: "Transmuta\xE7\xE3o", value: "transmutacao" },
        { name: "Ressurei\xE7\xE3o", value: "ressureicao" }
      ).setRequired(true)
    ).addIntegerOption(
      (option) => option.setName("gemas").setDescription("Quantidade de gemas a depositar.").setRequired(true)
    ).addStringOption(
      (option) => option.setName("origem").setDescription("URL apontando para a mensagem que justifica a origem das gemas.").setRequired(true)
    )
  ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const author = interaction.user.id;
    const source = interaction.options.getString("origem");
    const subcommand = interaction.options.getSubcommand();
    const player = await loadPlayer(author);
    const amount = interaction.options.getInteger("ouro") ?? interaction.options.getInteger("gemas");
    if (!sourceValidation(source)) {
      await interaction.editReply("Origem inv\xE1lida.");
      return;
    }
    if (!player) {
      await interaction.editReply("Jogador n\xE3o encontrado. Utilize `/registrar` para se cadastrar.");
      return;
    }
    if (subcommand === "ouro") {
      const bankChannel = interaction.client.channels.cache.get(channels.bank);
      player.addGold(amount);
      const goldLog = new Log("ouro", author, bankChannel.id, goldLogBuilder(player, "deposita", amount, source));
      try {
        await updatePlayer(player);
        await registerLog(goldLog, author);
        bankChannel.send(goldLog.content);
        await interaction.editReply(`${amount} PO adicionados com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar ouro: ${error}`);
      }
    } else if (subcommand === "gema") {
      const treasureChannel = interaction.client.channels.cache.get(channels.treasure);
      const type = interaction.options.getString("tipo");
      player.addGems(type, amount);
      const gemLog = new Log("gema", author, treasureChannel.id, gemLogBuilder(player, type, amount, "deposita", source));
      try {
        await updatePlayer(player);
        await registerLog(gemLog, author);
        treasureChannel.send(gemLog.content);
        await interaction.editReply(`${amount} Gema(s) ${GemTypes[type]} adicionada(s) com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao depositar gemas: ${error}`);
      }
    }
  }
};
