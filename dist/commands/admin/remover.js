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

// src/commands/admin/remover.ts
var import_discord = require("discord.js");

// src/lib/firebase/firestoreQuerys.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

// src/config.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var env = process.env.NODE_ENV || "development";
var envPath = import_path.default.resolve(process.cwd(), `.env.${env}`);
if (import_fs.default.existsSync(envPath)) {
  import_dotenv.default.config({ path: envPath });
}
var defaultEnvPath = import_path.default.resolve(process.cwd(), `.env`);
if (import_fs.default.existsSync(defaultEnvPath)) {
  import_dotenv.default.config({ path: defaultEnvPath });
}
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

// src/lib/firebase/firestoreQuerys.ts
var app = (0, import_app.initializeApp)(firebaseConfig);
var db = (0, import_firestore.getFirestore)(app);
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
async function deletePlayer(playerId) {
  const ref = (0, import_firestore.doc)(db, collections.users, playerId.toString());
  try {
    await (0, import_firestore.deleteDoc)(ref);
    console.log(`Player ${playerId} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete player ${playerId}: ${error}`);
  }
}

// src/commands/admin/remover.ts
module.exports = {
  data: new import_discord.SlashCommandBuilder().setName("remover").setDescription("Remove um jogador cadastrado do servidor").addUserOption(
    (option) => option.setName("jogador").setDescription("O jogador a ser removido").setRequired(true)
  ).setDefaultMemberPermissions(import_discord.PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const target = interaction.options.getUser("jogador").id;
    const player = await loadPlayer(target);
    if (!player) {
      await interaction.editReply("Jogador n\xE3o encontrado.");
      return;
    }
    try {
      deletePlayer(target);
      await interaction.editReply(`Jogador <@${target}> deletado.`);
    } catch (error) {
      await interaction.editReply(`Falha ao deletar jogador: ${error}`);
    }
  }
};
