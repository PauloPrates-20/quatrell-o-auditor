import { levelsTable, tiersTable } from './tables';
import { Gems, CharacterDef } from './definitions';

export class Player {
	id: string;
	gold: number;
	gems: Gems;
	characters: CharacterDef[];

	constructor({
		id, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = []
	}: {
		id: string;
		gold: number;
		gems: Gems;
		characters: CharacterDef[];
	}) {
		this.id = id;
		this.gold = gold;
		this.gems = gems;
		this.characters = characters;
	}

	/* Mutation methods */

	// Adds gold to the player
	addGold(amount: number) {
		this.gold += amount;
	}

	// Removes gold from the player
	subGold(amount: number) {
		if(this.gold < amount) {
			throw new Error('ouro insuficiente');
		}

		this.gold -= amount;
	}

	// Adds a character to the player
	registerCharacter(character: Character) {
		const index = this.characters.findIndex(char => char.name === character.name);
		if(index !== -1) {
			throw new Error('personagem já existe.');
		}

		this.characters.push(Object.assign({}, character));
	}

	// Deletes a character from the player
	deleteCharacter(name: string) {
		const index = this.characters.findIndex(char => char.name === name);

		if(index === -1) {
			throw new Error('personagem não encontrado.');
		}

		this.characters.splice(index, 1);
	}

	// Renames a character (Create a new character with the same stats and delete the old)
	renameCharacter(oldName: string, newName: string) {
		const index = this.characters.findIndex(char => char.name === oldName);
		const newIndex = this.characters.findIndex(char => char.name === newName);

		if(index === -1) {
			throw new Error('personagem não encontrado.');
		}
		if(newIndex !== -1) {
			throw new Error('personagem já existe.');
		}

		this.characters[index].name = newName;
	}

	// Adds gems to the player
	addGems(type: keyof Gems, amount: number) {
		this.gems[type] += amount;
	}

	// Removes gems from the player
	subGems(type: keyof Gems, amount: number) {
		if(this.gems[type] < amount) {
			throw new Error('gemas insuficientes.');
		}
		this.gems[type] -= amount;
	}
}

export class Character {
	name: string;
	xp: number;
	level: number;
	tier: string;

	constructor({
		name,
		xp = 2,
		level = 3,
		tier = tiersTable[0].tier,
	}: {
		name: string;
		xp: number;
		level: number;
		tier: string;
	}) {
		this.name = name;
		this.xp = xp;
		this.level = level;
		this.tier = tier;
	}

	// Add xp to a character
	addXp(amount: number) {
		this.xp += amount;

		this.updateLevel();
	}

	// Subtract xp from a character
	subXp(amount: number) {
		if(this.xp < amount) {
			throw new Error('XP do personagem não pode ser inferior a 0.')
		}

		this.xp -= amount;
		this.updateLevel();
	}

	// Sets the character xp value to the amount parsed
	setXp(amount: number) {
		if(amount < 0) {
			throw new Error('XP do personagem não pode ser inferior a 0.')
		}

		this.xp = amount;
		this.updateLevel();
	}

	// Changes character level
	updateLevel() {
		for (const level of levelsTable) {
			if (this.xp >= level.xp) {
				this.level = level.level;
			}
		}

		this.updateTier();
	}

	// Changes character tier
	updateTier() {
		for (const tier of tiersTable) {
			if (this.level >= tier.level) {
				this.tier = tier.tier;
			}
		}
	}
}

export class Log {
	type;
	targets;
	channels
	content;

	constructor(type: string, targets: string[] | string, channels: string[] | string, content: string) {
		this.type = type;
		this.targets = targets;
		this.channels = channels;
		this.content = content;
	}
}

export class Sanitizer {
	static urlComponents(url: string): string[] {
		const components = url.match(/\d{18,}/g);
		const [guildId, channelId, messageId] = components!;

		return [guildId, channelId, messageId];
	}

	static gemType(input: string) {
		return input.normalize('NFD').replace(/\W/g, '').toLowerCase();
	}
}