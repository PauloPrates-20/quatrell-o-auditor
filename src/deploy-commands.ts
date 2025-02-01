/* Imports */
// Require node's native file system modules
import fs from 'node:fs';
import path from 'node:path';
// Require necessary discord.js classes
import { REST, Routes } from 'discord.js';
// Require necessary config params
import { clientId, guildId, token } from './config';

const commands = [];
// Grab all the command folders from the commands directory
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory
	const commandFilesPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandFilesPath).filter((file: any) => file.endsWith('.ts') || file.endsWith('.js'));

	// Grab the SlachCommandBuilder#toJSON() output for each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandFilesPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] Command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token!);

// Deploy the commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId!, guildId!),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

// Delete commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error);