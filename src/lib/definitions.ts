import { Client } from 'discord.js';

export interface CustomClient extends Client {
  commands?: any;
};

export interface Gems {
  comum: number;
  transmutacao: number;
  ressureicao: number;
};

export interface Item {
  name: string;
  price: number;
}

export type Actions = 'deposita' | 'retira';