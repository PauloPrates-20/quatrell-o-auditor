// dotenv configuration
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const env = process.env.NODE_ENV || 'development'
const envPath = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const defaultEnvPath = path.resolve(process.cwd(), `.env`);
if (fs.existsSync(defaultEnvPath)) {
    dotenv.config({ path: defaultEnvPath });
}

const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    CHANNELS_BANK,
    CHANNELS_XP,
    CHANNELS_TREASURE,
    CHANNELS_TRANSFERENCIES,
    CHANNELS_GENERAL,
    CHANNELS_SHOP,
    CHANNELS_INVENTORY,
    CHANNELS_MAGIC,
    CHANNELS_FORGE,
    FIREBASE_SERVICE_ACCOUNT,
    COLLECTIONS_USERS
} = process.env;

// Firebase configs
export const firebaseServiceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT!);
export const collections = {
    users: COLLECTIONS_USERS!,
};

// Discord configs
export const token = DISCORD_TOKEN;
export const clientId = DISCORD_CLIENT_ID;
export const guildId = DISCORD_GUILD_ID;

// Channel IDs
export const channels = {
    bank: CHANNELS_BANK,
    xp: CHANNELS_XP,
    treasure: CHANNELS_TREASURE,
    transferencies: CHANNELS_TRANSFERENCIES,
    general: CHANNELS_GENERAL,
    shop: CHANNELS_SHOP,
    inventory: CHANNELS_INVENTORY,
    magic: CHANNELS_MAGIC,
    forge: CHANNELS_FORGE,
};