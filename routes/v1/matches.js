import express from 'express';

import Summoner from '../../schema/summoners';
import SummonerMatch from '../../schema/summonerMatches';
import Match from '../../schema/matches';

import callApi from '../../utils/callApi';

const router = express.Router();

const {HOST, TOKEN} = process.env;

const getMatches = async (accountId, queue, beginIndex, timestamp) => {
  const result = await callApi(
    `/match/v4/matchlists/by-account/${accountId}`,
    {
      queue,
      beginIndex,
    }
  );

  const newMatches = result.matches.filter(m => !timestamp || m.timestamp > timestamp);

  if(newMatches.length === 0) {
    return await Match.find({timestamp: {$lte: timestamp}});
  }

  Match.insertMany(newMatches)
  SummonerMatch.insertMany(newMatches.map(m => ({
    accountId,
    gameId: m.gameId,
    timestamp: m.timestamp,
  })));

  if(newMatches.length < result.matches.length) {
    return [
      ...newMatches,
      ...(await Match.find({timestamp: {$lte: timestamp}}))
    ];
  }

  if(result.endIndex === result.totalGames) {
    return result.matches;
  }

  return [
    ...result.matches,
    ...(await getMatches(accountId, queue, beginIndex + 100, timestamp)),
  ];
}

router.get('/:accountId/', async (req, res) => {
  try {
    const summonerMatches = await SummonerMatch
      .find({accountId: req.params.accountId})
      .sort({timestamp: -1})
      .limit(1);

    const result = await getMatches(
      req.params.accountId,
      req.query.queue,
      0,
      summonerMatches[0] && summonerMatches[0].timestamp
    );

    res.json(result);

  } catch(e) {
    res.json(e);
  }
});

export default router;
