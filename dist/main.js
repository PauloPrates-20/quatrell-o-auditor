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

// src/main.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
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
var token = DISCORD_TOKEN;

// src/lib/firebase/firestoreQuerys.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

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

// src/main.ts
var client = new import_discord.Client({
  intents: [
    import_discord.GatewayIntentBits.Guilds,
    import_discord.GatewayIntentBits.GuildMessages,
    import_discord.GatewayIntentBits.MessageContent
  ]
});
client.commands = new import_discord.Collection();
var commandFoldersPath = import_node_path.default.join(__dirname, "commands");
var commandFolders = import_node_fs.default.readdirSync(commandFoldersPath);
for (const folder of commandFolders) {
  const commandFilesPath = import_node_path.default.join(commandFoldersPath, folder);
  const commandFiles = import_node_fs.default.readdirSync(commandFilesPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = import_node_path.default.join(commandFilesPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] Command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}
client.once(import_discord.Events.ClientReady, (readyClient) => {
  console.log(`Ready. Logged as ${readyClient.user.tag}`);
});
client.on(import_discord.Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command2 = client.commands.get(interaction.commandName);
    if (command2.data.name === "personagem") {
      const player = await loadPlayer(interaction.member.id);
      if (!player) {
        await interaction.respond([]);
        return;
      }
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name === "personagem") {
        const choices = Object.keys(player.characters).map((key) => {
          const character = player.characters[key];
          return {
            // What the player sees
            name: character.name,
            // The actual value passed to the command
            value: character.name
          };
        });
        const filteredChoices = choices.filter((choice) => choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()));
        await interaction.respond(filteredChoices.slice(0, 25));
      }
    } else if (command2.data.name === "ajustar" && interaction.options.getSubcommand() === "xp") {
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name === "personagem") {
        const options = interaction.options.data[0]?.options || [];
        const jogadorOption = options.find((option) => option.name === "jogador");
        const target = jogadorOption.value;
        console.log("Target member: ", target);
        if (!target) {
          console.error("Target member was not found.");
          await interaction.respond([]);
          return;
        }
        const targetMember = await interaction.guild.members.fetch(target);
        const player = await loadPlayer(targetMember.id);
        if (!player) {
          await interaction.respond([]);
          return;
        }
        const choices = Object.keys(player.characters).map((key) => {
          const character = player.characters[key];
          return {
            name: character.name,
            value: character.name
          };
        });
        const filteredChoices = choices.filter((choice) => choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()));
        await interaction.respond(filteredChoices);
      }
    }
  }
  if (!interaction.isChatInputCommand()) return;
  const interactionClient = interaction.client;
  const command = interactionClient.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} found`);
    return;
  }
  try {
    command.execute(interaction);
  } catch (error) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `Ocorreu um erro ao executar o comando: ${error}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `Ocorreu um erro ao executar o comando: ${error}`, ephemeral: true });
    }
  }
});
client.login(token);
