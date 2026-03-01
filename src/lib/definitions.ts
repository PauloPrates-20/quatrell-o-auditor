import { Client } from 'discord.js';

export interface CustomClient extends Client {
    commands?: any;
};

export type Gems = {
    comum: number;
    transmutacao: number;
    ressureicao: number;
};

export interface CharacterDef {
    name: string;
    xp: number;
    level: number;
    tier: string;
    inventory: Item[];
    attunements: number;
};

export type Actions = 'deposita' | 'retira';

export type Item = {
    name: string;
    price: number;
    count: number;
    attuned?: boolean;
}