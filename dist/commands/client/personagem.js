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

// src/commands/client/personagem.ts
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
var Character = class {
  constructor(name) {
    this.name = name;
    this.xp = 0;
    this.level = 1;
    this.tier = tiersTable[0].tier;
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

// src/lib/validation.ts
function sourceValidation(source) {
  const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;
  return pattern.test(source);
}

// src/lib/messages.ts
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

// src/commands/client/personagem.ts
module.exports = {
  data: new import_discord.SlashCommandBuilder().setName("personagem").setDescription("Conjunto de comandos relacionados aos personagens do jogador.").addSubcommand(
    (subcommand) => subcommand.setName("adicionar").setDescription("Adiciona um novo personagem \xE0 lista de personagens do jogador.").addStringOption(
      (option) => option.setName("personagem").setDescription("Nome do personagem").setRequired(true)
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("remover").setDescription("Remove o personagem escolhido da lista de personagens do jogador.").addStringOption(
      (option) => option.setName("personagem").setDescription("Nome do personagem").setRequired(true).setAutocomplete(true)
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("renomear").setDescription("Renomeia um personagem, mantendo seus atributos.").addStringOption(
      (option) => option.setName("personagem").setDescription("Personagem a ser renomeado.").setRequired(true).setAutocomplete(true)
    ).addStringOption(
      (option) => option.setName("nome").setDescription("Novo nome.").setRequired(true)
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("add-xp").setDescription("Adiciona XP ao personagem escolhido.").addIntegerOption(
      (option) => option.setName("xp").setDescription("Quantidade de XP a adicionar").setRequired(true)
    ).addStringOption(
      (option) => option.setName("personagem").setDescription("Nome do personagem").setRequired(true).setAutocomplete(true)
    ).addStringOption(
      (option) => option.setName("origem").setDescription("URL apontando para a mensagem que justifica o ganho de XP.").setRequired(true)
    )
  ).addSubcommand(
    (subcommand) => subcommand.setName("sub-xp").setDescription("Subtrai xp do personagem selecionado.").addIntegerOption(
      (option) => option.setName("xp").setDescription("Quantidade de xp a subtrair").setRequired(true)
    ).addStringOption(
      (option) => option.setName("personagem").setDescription("Nome do personagem").setRequired(true).setAutocomplete(true)
    ).addStringOption(
      (option) => option.setName("origem").setDescription("URL apontando para a mensagem que justifica a retirada de XP.").setRequired(true)
    )
  ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const author = interaction.user.id;
    const player = await loadPlayer(author);
    const subcommand = interaction.options.getSubcommand();
    const { name, key } = Sanitizer.character(interaction.options.getString("personagem"));
    const xpChannel = interaction.client.channels.cache.get(channels.xp);
    if (!player) {
      await interaction.editReply("Jogador n\xE3o cadastrado. Utilize `/registrar` para se cadastrar.");
      return;
    }
    if (/\d/.test(name.charAt(0))) {
      await interaction.editReply("O nome do personagem n\xE3o pode come\xE7ar com n\xFAmeros.");
      return;
    }
    if (subcommand === "adicionar") {
      const character = new Character(name);
      if (player.characters[key]) {
        await interaction.editReply("J\xE1 existe um personagem com este nome.");
        return;
      }
      player.registerCharacter(character, key);
      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} adicionado com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao adicionar personagem: ${error}`);
      }
    } else if (subcommand === "remover") {
      if (!player.characters[key]) {
        await interaction.editReply("Personagem n\xE3o encontrado. Utlize o comando `/listar` para conferir seus personagens.");
        return;
      }
      player.deleteCharacter(key);
      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${name} removido com sucesso.`);
        xpChannel.send(`Personagem ${name} de <@${interaction.member.id}> deletado.`);
      } catch (error) {
        await interaction.editReply(`Falha ao deletar personagem: ${error}`);
      }
    } else if (subcommand === "renomear") {
      const { name: newName, key: newKey } = Sanitizer.character(interaction.options.getString("nome"));
      if (/\d/.test(newName.charAt(0))) {
        await interaction.editReply("O nome do personagem n\xE3o pode come\xE7ar com n\xFAmeros.");
        return;
      }
      if (!player.characters[key]) {
        await interaction.editReply("Personagem n\xE3o encontrado. Utlize o comando `/listar` para conferir seus personagens.");
        return;
      }
      if (player.characters[newKey]) {
        await interaction.editReply("J\xE1 existe um personagem com este nome.");
        return;
      }
      const oldName = player.characters[key].name;
      player.renameCharacter(key, newKey, newName);
      try {
        await updatePlayer(player);
        await interaction.editReply(`Personagem ${oldName} renomeado para ${newName}.`);
        xpChannel.send(`Personagem ${oldName} de <@${author}> renomeado para ${newName}.`);
      } catch (error) {
        await interaction.editReply(`Falha ao renomear personagem: ${error}`);
      }
    } else if (subcommand === "add-xp") {
      const source = interaction.options.getString("origem");
      if (!sourceValidation(source)) {
        interaction.editReply("Origem inv\xE1lida.");
        return;
      }
      if (!player.characters[key]) {
        await interaction.editReply("Personagem n\xE3o encontrado. Utlize o comando `/listar` para conferir seus personagens.");
        return;
      }
      const addedXp = interaction.options.getInteger("xp");
      player.addXp(key, addedXp);
      try {
        const log = new Log("xp", author, xpChannel.id, xpLogBuilder(player, key, addedXp, source));
        await updatePlayer(player);
        await registerLog(log, author);
        xpChannel.send(log.content);
        await interaction.editReply(`${addedXp} XP adicionados ao personagem ${name} com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao adicionar XP ao personagem: ${error}`);
      }
    } else if (subcommand === "sub-xp") {
      const source = interaction.options.getString("origem");
      const removedXp = interaction.options.getInteger("xp");
      if (!sourceValidation(source)) {
        interaction.editReply("Origem inv\xE1lida.");
        return;
      }
      if (!player.characters[key]) {
        await interaction.editReply("Personagem n\xE3o encontrado. Utlize o comando `/listar` para conferir seus personagens.");
        return;
      }
      if (player.characters[key].xp < removedXp) {
        await interaction.editReply("XP do personagem n\xE3o pode ficar abaixo de 0");
        return;
      }
      player.subXp(key, removedXp);
      try {
        const log = new Log("xp", author, xpChannel.id, xpLogBuilder(player, key, -removedXp, source));
        await updatePlayer(player);
        await registerLog(log, author);
        xpChannel.send(log.content);
        await interaction.editReply(`${removedXp} XP subtra\xEDdos do personagem ${name} com sucesso.`);
      } catch (error) {
        await interaction.editReply(`Falha ao subtrair XP do personagem: ${error}`);
      }
    }
  }
};
