import { Gems, CharacterDef } from '../definitions';

export class Player {
  id;
  gold;
  gems;
  characters: CharacterDef[];

  constructor(id: string, gold = 0, gems = { comum: 0, transmutacao: 0, ressureicao: 0 }, characters = []) {
    this.id = id;
    this.gold = gold;
    this.gems = gems;
    this.characters = characters;
  }

  setGold(amount: number) {
    this.gold = amount;
  }

  changeGold(amount: number) {
    this.gold += amount;
  }

  setGems(key: keyof Gems, amount: number) {
    this.gems[key] = amount;
  }

  changeGems(key: keyof Gems, amount: number) {
    this.gems[key] += amount;
  }

  appendCharacterList(character: CharacterDef) {
    this.characters.push(character);
  }

  removeCharacter(name: string) {
    this.characters = this.characters.filter((char) => char.name !== name);
  }

  updateCharacter(character: CharacterDef) {
    this.characters[this.characters.findIndex(char => char.name === character.name)] = { ...character }; 
  }

  getCharacter(name: string) {
    return this.characters.find((char) => char.name === name);
  }
}