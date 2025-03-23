"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  client: () => client
});
module.exports = __toCommonJS(main_exports);
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
var token = DISCORD_TOKEN;
var channels = {
  bank: CHANNELS_BANK,
  xp: CHANNELS_XP,
  treasure: CHANNELS_TREASURE,
  transferencies: CHANNELS_TRANSFERENCIES,
  general: CHANNELS_GENERAL,
  shop: CHANNELS_SHOP
};

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

// src/main.ts
var import_express2 = __toESM(require("express"));

// src/router.ts
var import_express = require("express");

// src/lib/messages.ts
function goldLogBuilder(player, action, amount, source) {
  const actionText = { retira: "Retira", deposita: "Deposita" };
  const message = `Jogador: <@${player.id}>
${actionText[action]}: ${amount} PO
Ouro Total: ${player.gold} PO
Origem: ${source}`;
  return message;
}
function purchaseLogBuilder(target, item, amount, price) {
  const message = `Jogador: <@${target}>
Compra: ${amount}x ${item}
Valor: ${price} PO`;
  return message;
}

// src/router.ts
var router = (0, import_express.Router)();
var router_default = router.post("/buy", async (req, res) => {
  const { accessToken, item } = req.body;
  console.log(accessToken, item);
  if (!(accessToken || item)) {
    res.status(400).json({ error: "Missing required fields!" });
    return;
  }
  const response = await fetch("https://discord.com/api/oauth2/@me", {
    headers: { "Authorization": `Bearer ${req.body.accessToken}` }
  });
  const data = await response.json();
  if (data.code == 0) {
    res.status(400).json({ ok: false, message: data.message });
    return;
  }
  const playerId = data.user.id;
  const user = await client.users.fetch(playerId);
  console.log(playerId);
  if (!user) {
    res.status(404).json({ error: "Player not found!" });
    return;
  }
  const player = await loadPlayer(playerId);
  if (!player) {
    res.status(404).json({ error: "Jogador n\xE3o encontrado! Utilize o comando `/registrar` para se cadastrar." });
    return;
  }
  if (player.gold < item.price) {
    res.status(400).json({ error: "Ouro insuficiente!" });
    return;
  }
  try {
    const purchaseChannel = client.channels.cache.get(channels.shop);
    const bankChannel = client.channels.cache.get(channels.bank);
    const purchaseLog = new Log("purchase", playerId, purchaseChannel?.id, purchaseLogBuilder(playerId, item.name, 1, item.value));
    const purchaseMessage = await purchaseChannel.send(purchaseLog.content);
    player.subGold(item.value);
    const goldLog = new Log("gold", playerId, bankChannel.id, goldLogBuilder(player, "retira", item.value, purchaseMessage.url));
    Promise.all([
      bankChannel.send(goldLog.content),
      updatePlayer(player),
      registerLog(goldLog, playerId),
      registerLog(purchaseLog, playerId)
    ]);
  } catch (error) {
    res.status(500).json({ error: "N\xE3o foi poss\xEDvel concluir a compra!", details: error });
  }
  res.status(200).json({ success: true, message: `Compra realizada com sucesso!` });
});

// src/main.ts
var app2 = (0, import_express2.default)();
app2.use(import_express2.default.json());
app2.use("/api", router_default);
app2.listen(5e3, "0.0.0.0", () => {
  console.log("API ready at port 5000!");
});
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
  console.log(`Ready! Logged as ${readyClient.user.tag}.`);
});
client.on(import_discord.Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command2 = client.commands.get(interaction.commandName);
    if (command2.data.name === "personagem" || command2.data.name === "corrigir" && interaction.options.getSubcommand() === "xp") {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  client
});
