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

// src/commands/client/corrigir.ts
var import_discord = require("discord.js");

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
  general: CHANNELS_GENERAL
};

// src/lib/validation.ts
function sourceValidation(source) {
  const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;
  return pattern.test(source);
}

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
var Sanitizer = class {
  static character(input) {
    const name = input.trim().replace(/\s{2,}/g, " ");
    const key = name.replace(/\s/g, "_").normalize("NFD").replace(/\W/g, "").toLowerCase();
    return { name, key };
  }
  static urlComponents(url) {
    const components = url.match(/\d{18,}/g);
    const [guildId, channelId, messageId] = components;
    return [guildId, channelId, messageId];
  }
  static gemType(input) {
    return input.normalize("NFD").replace(/\W/g, "").toLowerCase();
  }
};

// src/lib/firebase/firestoreQuerys.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
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

// src/commands/client/corrigir.ts
async function fetchMessage(interaction, messageId, messageChannel, baseUrl, channel) {
  if (messageChannel !== channel.id) {
    await interaction.editReply(`Mensagem inv\xE1lida: selecione uma mensagem no canal ${baseUrl}/${channel.id}`);
  }
  return await channel.messages.fetch(messageId);
}
async function applyCorrection(player, author, log, channel, messageUrl, message, interaction) {
  Promise.all([
    updatePlayer(player),
    registerLog(log, author),
    channel.send(`Corre\xE7\xE3o do lan\xE7amento ${messageUrl}

` + log.content),
    message.react("\u274C"),
    interaction.editReply("Lan\xE7amento corrigido com sucesso.")
  ]);
}
module.exports = {
  data: new import_discord.SlashCommandBuilder().setName("corrigir").setDescription("Corrige lan\xE7amentos errados").addSubcommand(
    (subcommand) => subcommand.setName("ouro").setDescription("Corrige um lan\xE7amento jogador no banco.").addStringOption(
      (option) => option.setName("mensagem").setDescription("A URL da mensagem a corrigir").setRequired(true)
    ).addStringOption(
      (options) => options.setName("a\xE7\xE3o").setDescription("Define se o lan\xE7amento deve adicionar ou remover").addChoices(
        { name: "Adicionar", value: "deposita" },
        { name: "Retirar", value: "retira" }
      )
    ).addIntegerOption(
      (option) => option.setName("ouro").setDescription("Valor correto para o lan\xE7amento.")
    ).addStringOption(
      (option) => option.setName("origem").setDescription("A URL da mensagem que justifica o lan\xE7amento.")
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("gema").setDescription("Corrige um lan\xE7amento jogador no banco.").addStringOption(
      (option) => option.setName("mensagem").setDescription("A URL da mensagem a corrigir").setRequired(true)
    ).addStringOption(
      (options) => options.setName("a\xE7\xE3o").setDescription("Define se o lan\xE7amento deve adicionar ou remover").addChoices(
        { name: "Adicionar", value: "deposita" },
        { name: "Retirar", value: "retira" }
      )
    ).addStringOption(
      (option) => option.setName("tipo").setDescription("Tipo correto das gemas para o lan\xE7amento").addChoices(
        { name: "Comum", value: "comum" },
        { name: "Transmuta\xE7\xE3o", value: "transmutacao" },
        { name: "Ressurei\xE7\xE3o", value: "ressureicao" }
      )
    ).addIntegerOption(
      (option) => option.setName("gemas").setDescription("Valor correto para o lan\xE7amento.")
    ).addStringOption(
      (option) => option.setName("origem").setDescription("A URL da mensagem que justifica o lan\xE7amento.")
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("xp").setDescription("Corrige um lan\xE7amento jogador no banco.").addStringOption(
      (option) => option.setName("mensagem").setDescription("A URL da mensagem a corrigir").setRequired(true)
    ).addStringOption(
      (options) => options.setName("a\xE7\xE3o").setDescription("Define se o lan\xE7amento deve adicionar ou remover").addChoices(
        { name: "Adicionar", value: "deposita" },
        { name: "Retirar", value: "retira" }
      )
    ).addIntegerOption(
      (option) => option.setName("xp").setDescription("Valor correto para o lan\xE7amento.")
    ).addStringOption(
      (option) => option.setName("personagem").setDescription("Nome do personagem").setAutocomplete(true)
    ).addStringOption(
      (option) => option.setName("origem").setDescription("A URL da mensagem que justifica o lan\xE7amento.")
    )
  ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const author = interaction.user.id;
    const clientGuild = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const messageUrl = interaction.options.getString("mensagem");
    const baseUrl = `https://discord.com/channels/${clientGuild}`;
    const player = await loadPlayer(author);
    let amount = interaction.options.getInteger("ouro") ?? interaction.options.getInteger("gemas") ?? interaction.options.getInteger("xp");
    let action = interaction.options.getString("a\xE7\xE3o");
    let source = interaction.options.getString("origem");
    let type = interaction.options.getString("tipo");
    let character = interaction.options.getString("personagem");
    let { name, key } = character ? Sanitizer.character(character) : { name: null, key: null };
    if (!sourceValidation(messageUrl)) {
      await interaction.editReply("Mensagem inv\xE1lida.");
      return;
    }
    if (source && !sourceValidation(source)) {
      await interaction.editReply("Origem inv\xE1lida.");
      return;
    }
    if (!player) {
      await interaction.editReply("Jogador n\xE3o encontrado. Utilize o comando `/registrar` para se cadastrar.");
      return;
    }
    if (name && /\d/.test(name.charAt(0))) {
      await interaction.editReply("O nome do personagem n\xE3o pode come\xE7ar com n\xFAmeros.");
      return;
    }
    if (key && !player.characters[key]) {
      await interaction.editReply("Personagem n\xE3o encontrado. Utlize o comando `/listar` para conferir seus personagens.");
      return;
    }
    const [messageGuild, messageChannel, messageId] = Sanitizer.urlComponents(messageUrl);
    if (messageGuild !== clientGuild) {
      await interaction.editReply("Mensagem inv\xE1lida. Selecione uma mensagem neste servidor.");
      return;
    }
    const actionPattern = /(Deposita|Retira)/;
    const amountPattern = /(?:Deposita|Retira): (-?\d+)/;
    const sourcePattern = /Origem: (.+)/;
    if (subcommand === "ouro") {
      const channel = interaction.client.channels.cache.get(channels.bank);
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
      if (!message) {
        await interaction.editReply("Mensagem n\xE3o encontrada.");
        return;
      }
      if (!message.mentions.has(author)) {
        await interaction.editReply("S\xF3 \xE9 poss\xEDvel corrigir os pr\xF3prios lan\xE7amentos.");
        return;
      }
      const content = message.content;
      const originalAction = content.match(actionPattern)[0].toLowerCase();
      const originalAmount = parseInt(content.match(amountPattern)[1]);
      const originalSource = content.match(sourcePattern)[1];
      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
      if (originalAction === action) {
        if (originalAmount !== amount) {
          if (action === "deposita") {
            player.subGold(originalAmount);
            player.addGold(amount);
          } else {
            player.addGold(originalAmount);
            if (player.gold < amount) {
              await interaction.editReply("Ouro insuficiente.");
              return;
            }
            player.subGold(amount);
          }
        }
      } else {
        if (action === "deposita") {
          player.addGold(originalAmount);
          player.addGold(amount);
        } else {
          player.subGold(originalAmount);
          if (player.gold < amount) {
            await interaction.editReply("Ouro insuficiente.");
            return;
          }
          player.subGold(amount);
        }
      }
      const log = new Log("ouro", author, channel.id, goldLogBuilder(player, action, amount, source));
      try {
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (error) {
        await interaction.editReply(`Falha ao corrigir lan\xE7amento: ${error.message}`);
      }
    }
    if (subcommand === "gema") {
      const channel = interaction.client.channels.cache.get(channels.treasure);
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
      const typePattern = /(?:Gema\(s\)(?:\sda)?) (.+)/;
      if (!message) {
        await interaction.editReply("Mensagem n\xE3o encontrada.");
        return;
      }
      if (!message.mentions.has(author)) {
        await interaction.editReply("S\xF3 \xE9 poss\xEDvel corrigir os pr\xF3prios lan\xE7amentos.");
        return;
      }
      const content = message.content;
      const originalAction = content.match(actionPattern)[0].toLowerCase();
      const originalAmount = parseInt(content.match(amountPattern)[1]);
      const originalType = Sanitizer.gemType(content.match(typePattern)[1]);
      const originalSource = content.match(sourcePattern)[1];
      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
      type = type ?? originalType;
      if (originalAction === action) {
        if (originalAmount !== amount || originalType !== type) {
          if (action === "deposita") {
            player.subGems(originalType, originalAmount);
            player.addGems(type, amount);
          } else {
            player.addGems(originalType, originalAmount);
            if (player.gems[type] < amount) {
              await interaction.editReply("Gemas insuficientes.");
              return;
            }
            player.subGems(type, amount);
          }
        }
      } else {
        if (action === "deposita") {
          player.addGems(originalType, originalAmount);
          player.addGems(type, amount);
        } else {
          player.subGems(originalType, originalAmount);
          if (player.gems[type] < amount) {
            await interaction.editReply("Gemas insuficientes.");
            return;
          }
          player.subGems(type, amount);
        }
      }
      const log = new Log("gema", author, channel.id, gemLogBuilder(player, type, amount, action, source));
      try {
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (error) {
        await interaction.editReply(`Falha ao corrigir lan\xE7amento: ${error.message}`);
      }
    }
    if (subcommand === "xp") {
      const channel = interaction.client.channels.cache.get(channels.xp);
      const message = await fetchMessage(interaction, messageId, messageChannel, baseUrl, channel);
      const characterPattern = /Personagem: (.+)/;
      const xpPattern = /(-?\d+) (?:XP)/;
      if (!message) {
        await interaction.editReply("Mensagem n\xE3o encontrada.");
        return;
      }
      if (!message.mentions.has(author)) {
        await interaction.editReply("S\xF3 \xE9 poss\xEDvel corrigir os pr\xF3prios lan\xE7amentos.");
        return;
      }
      const content = message.content;
      console.log(content);
      const originalAction = parseInt(content.match(xpPattern)[1]) < 0 ? "retira" : "deposita";
      const originalAmount = Math.abs(parseInt(content.match(xpPattern)[1]));
      const originalSource = content.match(sourcePattern)[1];
      const originalCharacter = content.match(characterPattern)[1];
      const { name: originalName, key: originalKey } = Sanitizer.character(originalCharacter);
      action = action ?? originalAction;
      amount = amount ?? originalAmount;
      source = source ?? originalSource;
      name = name ?? originalName;
      key = key ?? originalKey;
      if (originalAction === action) {
        if (originalAmount !== amount || originalKey !== key) {
          if (action === "deposita") {
            player.subXp(originalKey, originalAmount);
            player.addXp(key, amount);
          } else {
            player.addXp(originalKey, originalAmount);
            if (player.characters[key].xp < amount) {
              await interaction.editReply("XP n\xE3o pode ficar abaixo de 0.");
              return;
            }
            player.subXp(key, amount);
          }
        }
      } else {
        if (action === "deposita") {
          player.addXp(originalKey, originalAmount);
          player.addXp(key, amount);
        } else {
          player.subXp(originalKey, originalAmount);
          if (player.characters[key].xp < amount) {
            await interaction.editReply("XP n\xE3o pode ficar abaixo de 0.");
            return;
          }
          player.subXp(key, amount);
        }
      }
      const oldLog = new Log("xp", author, channel.id, xpLogBuilder(player, originalKey, originalAction === "retira" ? originalAmount : -originalAmount, source));
      const log = new Log("xp", author, channel.id, xpLogBuilder(player, key, action === "retira" ? -amount : amount, source));
      try {
        if (originalKey !== key) await channel.send(`Corre\xE7\xE3o do lan\xE7amento: ${messageUrl}

` + oldLog.content);
        await applyCorrection(player, author, log, channel, messageUrl, message, interaction);
      } catch (error) {
        await interaction.editReply(`Falha ao corrigir lan\xE7amento: ${error.message}`);
      }
    }
  }
};
