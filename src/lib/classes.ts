import { levelsTable, tiersTable } from './tables';
import { Gems } from './definitions';
import { StringMappedInteractionTypes, TextChannel } from 'discord.js';
import { registerLog, updatePlayer } from './firebase/firestoreQuerys';

export class Player {
  id: string;
  gold: number;
  gems: Gems;
  characters: Character[];

	constructor(id: string, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters: Character[] = []) {
		this.id = id;
		this.gold = gold;
		this.gems = gems;
		this.characters = characters;
	}

	// Adds or subtracts gold to the player
	updateGold(amount: number, set = false) {
    if (set) this.gold = amount;
    else this.gold += amount; 
  }

  // Adds or subtracts gems to the player
	updateGems(type: keyof Gems, amount: number, set = false) {
    if (set) this.gems[type] = amount;
		else this.gems[type] += amount;
	}

	// Adds a character to the player
	addCharacter(character: Character) { this.characters.push(character); }

  // retrieves a character from the player
  getCharacter(name: string) { return this.characters.find(character => character.name === name); }

	// Deletes a character from the player
	deleteCharacter(name: string) { 
    const index = this.characters.findIndex(character => character.name === name);
    
    if (index !== -1) this.characters.splice(index, 1); 
  }

  toObject() {
    return { 
      id: this.id,
      gold: this.gold,
      gems: this.gems,
      characters: this.characters.map(character => character.toObject())
    };
  }

  static fromObject(player: Player) {
    const characters = player.characters.map(character => Character.fromObject(character));

    return new Player(player.id, player.gold, player.gems, characters);
  }
}

export class Character {
  name: string;
  xp: number;
  level: number;
  tier: string;

	constructor(name: string, xp = 0, level = 1, tier = tiersTable[0].tier) {
		this.name = name;
		this.xp = xp;
		this.level = level;
		this.tier = tier;
	}

  // Add, set or subtract xp for the character
  updateXp(amount: number, set = false) {
    if (set) this.xp = amount;
    else this.xp += amount;

    // checks for a level up (or down)
    for (const entry of levelsTable) {
      if (this.xp >= entry.xp) this.level = entry.level;
      else break;
    }

    // checks for a tier change
    for (const entry of tiersTable) {
      if (this.level >= entry.level) this.tier = entry.tier;  
      else break;
    }
  }

  rename(name: string) { this.name = name; }

  toObject() { return { ...this }; }

  static fromObject(character: Character) { return new Character(character.name, character.xp, character.level, character.tier); }
}