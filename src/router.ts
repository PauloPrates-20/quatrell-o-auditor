import { Request, Response, Router } from 'express';
import { loadPlayer } from './lib/firebase/firestoreQuerys';

const router = Router();

export default router
  .post('/buy', async (req: Request, res: Response) => {
    if (!req.body.accessToken) {
      res.status(400).json({ ok: false, message: 'Missing token in request body.' });
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

    res.status(200).json({ ok: true, id: playerId });
  })