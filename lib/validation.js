// Validates the source for the transactions within the bot.
// Source must be an url pointing to a discord message
function sourceValidation(source) {
	const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;

	return pattern.test(source);
}

module.exports = {
	sourceValidation,
};