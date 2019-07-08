import express from 'express';

import Summoner from '../../schema/summoners';
import Match from '../../schema/matches';

import callApi from '../../utils/callApi';

const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const result = await callApi(`/summoner/v4/summoners/by-name/${req.params.username}`);
    const summoner = await Summoner.findOne({accountId: result.accountId}).exec();

    if(!summoner) {
      new Summoner({
        ...result,
        userId: result.id,
      }).save();
    }

    res.json(result);

  } catch(e) {
    console.error('error', e);
    res.json(e);
  }
});

router.get('/entries/:userId', async (req, res) => {
  try {
    const result = await callApi(`/league/v4/entries/by-summoner/${req.params.userId}`);
    res.json(result);

  } catch(e) {
    console.error('error', e);
    res.json(e);
  }
});

module.exports = router;
