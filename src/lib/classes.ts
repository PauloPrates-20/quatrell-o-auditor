import { levelsTable, tiersTable } from './tables';
import { Gems, CharacterDef } from './definitions';

export class Player {
  id: string;
  gold: number;
  gems: Gems;
  characters: CharacterDef;

	constructor(id: string, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = {}) {
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
		this.gold -= amount;
	}

	// Adds a character to the player
	registerCharacter(character: Character, characterKey: string) {
		this.characters[characterKey] = Object.assign({}, character);
	}

	// Deletes a character from the player
	deleteCharacter(characterKey: string) {
		delete this.characters[characterKey];
	}

	// Renames a character (Create a new character with the same stats and delete the old)
	renameCharacter(oldKey: string, newKey: string, newName: string) {
		this.characters[newKey] = { ...this.characters[oldKey], name: newName };
		delete this.characters[oldKey];
	}

	// Add xp to a character
	addXp(characterKey: string, amount: number) {
		const character = this.characters[characterKey];
		character.xp += amount;

		this.changeLevel(character);
	}

	// Subtract xp from a character
	subXp(characterKey: string, amount: number) {
		const character = this.characters[characterKey];
		character.xp -= amount;

		this.changeLevel(character);
	}

	// Sets the character xp value to the amount parsed
	setXp(characterKey: string, amount: number) {
		const character = this.characters[characterKey];
		character.xp = amount;

		this.changeLevel(character);
	}

	// Changes character level
	changeLevel(character: Character) {
		for (const level of levelsTable) {
			if (character.xp >= level.xp) {
				character.level = level.level;
			}
		}

		this.changeTier(character);
	}

	// Changes character tier
	changeTier(character: Character) {
		for (const tier of tiersTable) {
			if (character.level >= tier.level) {
				character.tier = tier.tier;
			}
		}
	}

	// Adds gems to the player
	addGems(type: keyof Gems, amount: number) {
		this.gems[type] += amount;
	}

	// Removes gems from the player
	subGems(type: keyof Gems, amount: number) {
		this.gems[type] -= amount;
	}
}

export class Character {
  name: string;
  xp: number;
  level: number;
  tier: string;

	constructor(name: string) {
		this.name = name;
		this.xp = 0;
		this.level = 1;
		this.tier = tiersTable[0].tier;
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
  static character(input: string) {
    const name = input.trim().replace(/\s{2,}/g, ' ');
    const key = name.replace(/\s/g, '_').normalize('NFD').replace(/\W/g, '').toLowerCase();

    return { name, key };
  }

  static urlComponents(url: string): string[] {
    const components = url.match(/\d{18,}/g);
    const [guildId, channelId, messageId] = components!;

    return [guildId, channelId, messageId];
  }

  static gemType(input: string) {
    return input.normalize('NFD').replace(/\W/g, '').toLowerCase();
  }
}