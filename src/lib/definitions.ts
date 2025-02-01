import { Client } from 'discord.js';

export interface CustomClient extends Client {
  commands?: any;
};

export interface Gems {
  comum: number;
  transmutacao: number;
  ressureicao: number;
};

export interface CharacterDef {
  [characterName: string]: {
    name: string;
    xp: number;
    level: number;
    tier: string;
  };
};