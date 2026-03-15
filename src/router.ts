import { Request, Response, Router } from 'express';
import { client } from './main';
import { Character, Log } from './lib/classes';
import { loadPlayer, updatePlayer, registerLog } from './lib/firebase/firestoreQuerys';
import { channels } from './config';
import { goldLogBuilder, inventoryLogBuilder, purchaseLogBuilder, reforgeLogBuilder } from './lib/messages';
import { TextChannel } from 'discord.js';
import { Item } from './lib/definitions';

const router = Router();

export default router
    .get('/teste', async (req: Request, res: Response) => {
        res.status(200).send("OK");
    })
    .post('/buy', async (req: Request, res: Response) => {
        const { accessToken, item, charName } = req.body;

        if (!(accessToken || item || charName)) {
            res.status(400).json({ error: 'Missing required fields!' });
            return;
        }

        const response = await fetch('https://discord.com/api/oauth2/@me', {
            headers: { 'Authorization': `Bearer ${req.body.accessToken}` }
        });
        const data = await response.json();

        if (data.code == 0) {
            res.status(400).json({ ok: false, message: data.message });
            return;
        }

        const playerId = data.user.id;
        const user = await client.users.fetch(playerId);

        if (!user) {
            res.status(404).json({ error: 'Player not found!' });
            return;
        }

        try {
            const player = await loadPlayer(playerId);
            const character = new Character({ ...player.getCharacter(charName) });
            const purchaseChannel = client.channels.cache.get(channels.shop!) as TextChannel;
            const bankChannel = client.channels.cache.get(channels.bank!) as TextChannel;
            const inventoryChannel = client.channels.cache.get(channels.inventory!) as TextChannel;
            const inventoryItem: Item = {
                name: item.name,
                shortName: item.name,
                count: 1,
                price: (item.value as number),
            };

            player.subGold(inventoryItem.price);
            character.addItem(inventoryItem);
            player.updateCharacter(character.name, character);

            const purchaseLog = new Log('purchase', playerId, purchaseChannel?.id, purchaseLogBuilder(playerId, character, item.name, 1, item.value));
            const purchaseMessage = await purchaseChannel.send(purchaseLog.content);
            const goldLog = new Log('gold', playerId, bankChannel.id, goldLogBuilder(player, 'retira', inventoryItem.price, purchaseMessage.url));
            const inventoryLog = new Log('item', playerId, inventoryChannel.id, inventoryLogBuilder(playerId, 'deposita', character, inventoryItem, purchaseMessage.url));

            await Promise.all([
                updatePlayer(player),
                registerLog(goldLog, playerId),
                registerLog(purchaseLog, playerId),
                registerLog(inventoryLog, playerId),
                bankChannel.send(goldLog.content),
                inventoryChannel.send(inventoryLog.content),
            ]);

            res.status(200).json({ success: true, message: `Compra realizada com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: 'Não foi possível concluir a compra!', details: error instanceof Error ? error.message : error });
        }
    })
    .post('/reforge', async (req: Request, res: Response) => {
        const { accessToken, item, baseItem, charName, isUpgrade } = req.body;

        if (!(accessToken || item || baseItem || charName)) {
            res.status(400).json({ error: 'Missing required fields!' });
            return;
        }

        const response = await fetch('https://discord.com/api/oauth2/@me', {
            headers: { 'Authorization': `Bearer ${req.body.accessToken}` }
        });
        const data = await response.json();

        if (data.code == 0) {
            res.status(400).json({ ok: false, message: data.message });
            return;
        }

        const playerId = data.user.id;
        const user = await client.users.fetch(playerId);

        if (!user) {
            res.status(404).json({ error: 'Player not found!' });
            return;
        }

        try {
            const player = await loadPlayer(playerId);
            const character = new Character({ ...player.getCharacter(charName) });
            const forgeChannel = client.channels.cache.get(channels.forge!) as TextChannel;
            const bankChannel = client.channels.cache.get(channels.bank!) as TextChannel;
            const inventoryChannel = client.channels.cache.get(channels.inventory!) as TextChannel;
            const oldItem = { ...character.getItem(baseItem), count: 1 };
            const newItem: Item = {
                name: item.name + ` (${baseItem})`,
                shortName: item.name,
                count: 1,
                price: item.value,
                baseItem: baseItem,
            };

            if(oldItem.attuned) {
                newItem.attuned = oldItem.attuned;
            }

            if(isUpgrade) {
                if(!oldItem.baseItem) {
                    throw new Error('o item selecionado está na forma base.')
                }

                newItem.baseItem = oldItem.baseItem;
                newItem.name = newItem.shortName + ` (${newItem.baseItem})`;
                item.value -= oldItem.price;

                if(item.value < 0) {
                    throw new Error('valor do upgrade não pode ser inferior a 0 PO.');
                }
            }

            player.subGold(item.value);
            character.removeItem(oldItem);
            character.addItem(newItem);
            player.updateCharacter(character.name, character);

            const reforgeLog = new Log('purchase', playerId, forgeChannel?.id, reforgeLogBuilder(playerId, character, oldItem, newItem, item.value));
            const refogeMessage = await forgeChannel.send(reforgeLog.content);
            const goldLog = new Log('gold', playerId, bankChannel.id, goldLogBuilder(player, 'retira', newItem.price, refogeMessage.url));
            const oldInverotyLog = new Log('item', playerId, inventoryChannel.id, inventoryLogBuilder(playerId, 'retira', character, oldItem, refogeMessage.url));
            const newInventoryLog = new Log('item', playerId, inventoryChannel.id, inventoryLogBuilder(playerId, 'deposita', character, newItem, refogeMessage.url));

            await Promise.all([
                updatePlayer(player),
                registerLog(goldLog, playerId),
                registerLog(reforgeLog, playerId),
                registerLog(oldInverotyLog, playerId),
                registerLog(newInventoryLog, playerId),
                bankChannel.send(goldLog.content),
                inventoryChannel.send(oldInverotyLog.content),
                inventoryChannel.send(newInventoryLog.content),
            ]);

            res.status(200).json({ success: true, message: `Item reforjado com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: 'Não foi possível reforjar o item!', details: error instanceof Error ? error.message : error });
        }
    })