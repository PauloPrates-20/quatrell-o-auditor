import { Request, Response, Router } from 'express';
import { client } from './main';
import { Character, Log } from './lib/classes';
import { loadPlayer, updatePlayer, registerLog } from './lib/firebase/firestoreQuerys';
import { channels } from './config';
import { goldLogBuilder, inventoryLogBuilder, purchaseLogBuilder } from './lib/messages';
import { TextChannel } from 'discord.js';
import { Item } from './lib/definitions';

const router = Router();

export default router
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
            console.log(charName);
            const character = new Character({ ...player.getCharacter(charName) });
            const purchaseChannel = client.channels.cache.get(channels.shop!) as TextChannel;
            const bankChannel = client.channels.cache.get(channels.bank!) as TextChannel;
            const inventoryChannel = client.channels.cache.get(channels.inventory!) as TextChannel;
            const inventoryItem: Item = {
                name: (item.name as string),
                count: 1,
                price: (item.value as number),
                attuned: false,
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
                bankChannel.send(goldLog.content),
                inventoryChannel.send(inventoryLog.content),
            ]);

            res.status(200).json({ success: true, message: `Compra realizada com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: 'Não foi possível concluir a compra!', details: error instanceof Error ? error.message : error });
        }
    })