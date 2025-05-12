// Validates the source for the transactions within the bot.
// Source must be an url pointing to a discord message
export function sourceValidation(source: string): boolean {
	const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;

	return pattern.test(source);
}