import { levelsTable, tiersTable } from './tables';
import { Gems, CharacterDef } from './definitions';

export class Player {
  id: string;
  gold: number;
  gems: Gems;
  characters: Character[];

	constructor(id: string, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = []) {
		this.id = id;
		this.gold = gold;
		this.gems = gems;
		this.characters = characters;
	}

	// Adds or subtracts gold to the player
	updateGold(amount: number, set?: boolean) {
    if (set) this.gold = amount;
    else this.gold += amount; 
  }

  // Adds or subtracts gems to the player
	updateGems(type: keyof Gems, amount: number, set?: boolean) {
    if (set) this.gems[type] = amount;
		else this.gems[type] += amount;
	}

	// Adds a character to the player
	registerCharacter(character: Character) { this.characters.push({ ...character }); }

  getCharacterIndex(name: string) { return this.characters.findIndex(character => character.name === name); }

  getCharacter(name: string) {
    let character = this.characters[this.getCharacterIndex(name)];

    return character;
  }

	// Deletes a character from the player
	deleteCharacter(name: string) { this.characters.splice(this.getCharacterIndex(name)); }
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