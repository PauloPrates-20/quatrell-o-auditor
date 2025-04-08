import { Request, Response, Router } from 'express';
import { client } from './main';
import { Log } from './lib/classes';
import { loadPlayer, updatePlayer, registerLog } from './lib/firebase/firestoreQuerys';
import { channels } from './config';
import { goldLogBuilder, purchaseLogBuilder } from './lib/messages';
import { TextChannel } from 'discord.js';

const router = Router();

export default router
  .post('/buy', async (req: Request, res: Response) => {
    const { accessToken, item, character } = req.body;

    if (!(accessToken || item || character)) {
      res.status(400).json({ error: 'Missing required fields!' });
      return;
    }

    const response = await fetch('https://discord.com/api/oauth2/@me', {
      headers: { 'Authorization': `Bearer ${req.body.accessToken}`}
    });
    const data = await response.json();

    if (data.code == 0) {
      res.status(400).json({ ok: false, message: data.message });
      return;
    }

    const playerId = data.user.id;
    const user = await client.users.fetch(playerId);
    console.log(playerId);

    if (!user) {
      res.status(404).json({ error: 'Player not found!' });
      return;
    }

    const player = await loadPlayer(playerId);

    if (!player) {
      res.status(404).json({ error: 'Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar.' });
      return;
    }

    if (player.gold < item.price) {
      res.status(400).json({ error: 'Ouro insuficiente!' });
      return;
    }

    try {
      const purchaseChannel = client.channels.cache.get(channels.shop!) as TextChannel;
      const bankChannel = client.channels.cache.get(channels.bank!) as TextChannel;
      const purchaseLog = new Log('purchase', playerId, purchaseChannel?.id, purchaseLogBuilder(playerId, character.name, item.name, 1, item.value));
      const purchaseMessage = await purchaseChannel.send(purchaseLog.content);
      
      player.subGold(item.value);
      const goldLog = new Log('gold', playerId, bankChannel.id, goldLogBuilder(player, 'retira', item.value, purchaseMessage.url));

      Promise.all([
        bankChannel.send(goldLog.content),
        updatePlayer(player),
        registerLog(goldLog, playerId),
        registerLog(purchaseLog, playerId)
      ]);
    } catch (error) {
      res.status(500).json({ error: 'Não foi possível concluir a compra!', details: error });
    }

    res.status(200).json({ success: true, message: `Compra realizada com sucesso!` });
  })