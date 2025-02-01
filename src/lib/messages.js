// Builds the messages used for the logs in the channel #banco
function goldLogBuilder(player, action, amount, source) {
	const actionText = { retira: 'Retira', deposita: 'Deposita' };
	const message = `Jogador: <@${player.id}>\n${actionText[action.toLowerCase()]}: ${amount} PO\nOuro Total: ${player.gold} PO\nOrigem: ${source}`;

	return message;
}

// Builds the messages used for the logs in the channel #fonte-da-experiência
function xpLogBuilder(player, characterKey, amount, source) {
	const character = player.characters[characterKey];
	const message = `Jogador: <@${player.id}>\nPersonagem: ${character.name}\nGanho de Experiência: ${amount} XP\nExperiência Acumulada: ${character.xp} XP\nNível Atual: ${character.level}\nTier Atual: ${character.tier}\nOrigem: ${source}`;

	return message;
}

// Builds the messages used for the logs in the channel #tesouros-e-gemas
function gemLogBuilder(player, type, amount, action, source) {
	const types = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
	const actions = { retira: 'Retira', deposita: 'Deposita' };
	const actionType = actions[action.toLowerCase()];
	const gemType = types[type.toLowerCase()];
	const message = `Jogador: <@${player.id}>\n${actionType}: ${amount} Gema(s) ${gemType}\nTotal: ${player.gems.comum} Gema(s) Comum, ${player.gems.transmutacao} Gema(s) da Transmutação, ${player.gems.ressureicao} Gema(s) da Ressureição\nOrigem: ${source}`;

	return message;
}

// Builds the messages for logs used in the channel #transferências-entre-jogadores
function transferencyLogBuilder(type, targets, amount, gemType) {
	const gemTypes = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
	let currencyText = 'PO';

	if (type === 'gema') {
		const gem = gemTypes[gemType];
		currencyText = `Gema(s) ${gem}`;
	}
	const message = `Jogador: <@${targets[0]}>\nTransfere: ${amount} ${currencyText}\nPara: <@${targets[1]}>`;

	return message;
}

module.exports = {
	goldLogBuilder,
	xpLogBuilder,
	gemLogBuilder,
	transferencyLogBuilder,
};