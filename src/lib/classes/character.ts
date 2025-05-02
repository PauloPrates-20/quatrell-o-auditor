import { CharacterDef } from '../definitions';
import { levelsTable, tiersTable } from '../tables';

export class Character implements CharacterDef {
  name;
  xp;
  level;
  tier;

  constructor(name: string, xp = 0, level = 1, tier = tiersTable[0].tier) {
    this.name = name;
    this.xp = xp;
    this.level = level;
    this.tier = tier;
  }

  setTier() {
    tiersTable.forEach(row => {
      if (row.level <= this.level) this.tier = row.tier;
    });
  }

  setLevel() {
    levelsTable.forEach(row => {
      if (row.xp <= this.xp) this.level = row.level;
    });

    this.setTier();
  }

  setXp(amount: number) {
    this.xp = amount;
    this.setLevel();
  }

  changeXp(amount: number) {
    this.xp += amount;
    this.setLevel();
  }

  rename(name: string) {
    this.name = name
  }
}