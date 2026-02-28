// Validates the source for the transactions within the bot.
// Source must be an url pointing to a discord message
export function validateSource(source: string) {
	const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;

    if(!pattern.test(source)) {
        throw new Error('Origem inválida.');
    }
}