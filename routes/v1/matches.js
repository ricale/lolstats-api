import express from 'express';

import SummonerMatch from '../../schema/summonerMatches';
import MatchDetail from '../../schema/matchDetails';

import {fetchMatches} from './commons';

const router = express.Router();

const {HOST, TOKEN} = process.env;

router.get('/:accountId/', async (req, res) => {
  try {
    await fetchMatches(
      req.params.accountId,
      req.query.queue,
      13, // season
      0,
    );

    const summonerMatches = await SummonerMatch
      .find({accountId: req.params.accountId});

    const matchDetails = await MatchDetail
      .find({gameId: summonerMatches.map(m => m.gameId)});

    res.json(matchDetails[0]);

  } catch(e) {
    console.error(e);
    res.json(e);
  }
});

export default router;
