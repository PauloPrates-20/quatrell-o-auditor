import { Request, Response, Router } from 'express';
import { client } from './main';
import { channels } from './config';
import { loadPlayer } from './lib/firebase/firestoreQuerys';
import { TextChannel } from 'discord.js';
import { purchaseItem } from './lib/controllers/shop';

const router = Router();

export default router
  .post('/buy', async (req: Request, res: Response) => {
    const { accessToken, item, name } = req.body;

    if (!(accessToken || item || name)) {
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

    const player = await loadPlayer(playerId);
    const character = player?.getCharacter(name);
    const purchaseChannel = client.channels.cache.get(channels.shop) as TextChannel;
    const bankChannel = client.channels.cache.get(channels.bank) as TextChannel;

    try {
      await purchaseItem(player, character, item, 1, purchaseChannel, bankChannel);
      res.status(200).json({ success: true, message: `Compra realizada com sucesso!` });
    } catch (e: any) {
      res.status(500).json({ error: 'Não foi possível concluir a compra!', details: e.message });
    }
  })