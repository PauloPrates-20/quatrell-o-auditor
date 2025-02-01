const { levelsTable, tiersTable } = require('./tables');

class Player {
	constructor(id, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = {}) {
		this.id = id;
		this.gold = gold;
		this.gems = gems;
		this.characters = characters;
	}

	/* Mutation methods */

	// Adds gold to the player
	addGold(amount) {
		this.gold += parseInt(amount);
	}

	// Removes gold from the player
	subGold(amount) {
		this.gold -= parseInt(amount);
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
		character.xp += parseInt(amount);

		this.changeLevel(character);
	}

	// Subtract xp from a character
	subXp(characterKey, amount) {
		const character = this.characters[characterKey];
		character.xp -= parseInt(amount);

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
		this.gems[type] += parseInt(amount);
	}

	// Removes gems from the player
	subGems(type, amount) {
		this.gems[type] -= parseInt(amount);
	}
}

class Character {
	constructor(name) {
		this.name = name;
		this.xp = 0;
		this.level = 1;
		this.tier = tiersTable[0].tier;
	}
}

class Log {
	constructor(type, targets, channels, content) {
		this.type = type;
		this.targets = targets;
		this.channels = channels;
		this.content = content;
	}
}

module.exports = {
	Player,
	Character,
	Log,
};