/* Imports */
// Require node's native file systems modules
import fs from 'node:fs';
import path from 'node:path';
// Require the necessary discord.js classes
import { Client, Events, Collection, GatewayIntentBits, UserResolvable, GuildMember } from 'discord.js';
// Get the token
import { token } from './config';
import { loadPlayer } from './lib/firebase/firestoreQuerys';
import { CustomClient } from './lib/definitions';

// Creates the client instace
const client: CustomClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

/* Command Handling */
// Command storage initialization
client.commands = new Collection();

// Grab the command folders
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	// Grab the command files
	const commandFilesPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandFilesPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandFilesPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] Command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Bot login confirmation
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready. Logged as ${readyClient.user.tag}`);
});

// Event to receive and execute the chat commands
client.on(Events.InteractionCreate, async interaction => {
	// Handles autocomplete interactions for the /personagem command
	if (interaction.isAutocomplete()) {
		const command = client.commands.get(interaction.commandName);

		if (command.data.name === 'personagem') {
			const player = await loadPlayer((interaction.member as GuildMember).id);

			// Respond with an empty array if player data is not found
			if (!player) {
				await interaction.respond([]);
				return;
			}

			// Get the focused option in the autocomplete
			const focusedOption = interaction.options.getFocused(true);

			if (focusedOption.name === 'personagem') {
				const choices = Object.keys(player.characters).map(key => {
					const character = player.characters[key];
					return {
						// What the player sees
						name: character.name,
						// The actual value passed to the command
						value: character.name,
					};
				});

				// Filter choices base on user input
				const filteredChoices = choices.filter(choice => choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()));

				// Respond with the filtered choices
				await interaction.respond(filteredChoices.slice(0, 25));
			}
		} else if (command.data.name === 'ajustar' && interaction.options.getSubcommand() === 'xp') {
			const focusedOption = interaction.options.getFocused(true);

			if (focusedOption.name === 'personagem') {
				const options = interaction.options.data[0]?.options || [];
				const jogadorOption = options.find(option => option.name === 'jogador');
				const target = jogadorOption!.value;
				console.log('Target member: ', target);

				if (!target) {
					console.error('Target member was not found.');
					await interaction.respond([]);
					return;
				}

				const targetMember = await interaction.guild!.members.fetch(target as UserResolvable);
				const player = await loadPlayer(targetMember.id);

				if (!player) {
					await interaction.respond([]);
					return;
				}

				const choices = Object.keys(player.characters).map(key => {
					const character = player.characters[key];
					return {
						name: character.name,
						value: character.name,
					};
				});

				const filteredChoices = choices.filter(choice => choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()));

				await interaction.respond(filteredChoices);
			}
		}
	}

	// Checks if the received interaction was a chat command
	if (!interaction.isChatInputCommand()) return;

	// Gets the command name
  const interactionClient = interaction.client as CustomClient;
	const command = interactionClient.commands.get(interaction.commandName);

	// Check if the command exists
	if (!command) {
		console.error(`No command matching ${interaction.commandName} found`);
		return;
	}

	// Try to execute the command
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

// Login to discord with the token
client.login(token);