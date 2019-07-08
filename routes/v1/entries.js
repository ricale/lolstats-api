import express from 'express';

import Summoner from '../../schema/summoners';
import Match from '../../schema/matches';

import callApi from '../../utils/callApi';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const result = await callApi(`/league/v4/entries/by-summoner/${req.params.userId}`);
    res.json(result);

  } catch(e) {
    console.error('error', e);
    res.json(e);
  }
});

export default router;
