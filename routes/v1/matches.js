import express from 'express';

import Summoner from '../../schema/summoners';
import SummonerMatch from '../../schema/summonerMatches';
import Match from '../../schema/matches';
import MatchDetail from '../../schema/matchDetails';

import callApi from '../../utils/callApi';

const router = express.Router();

const {HOST, TOKEN} = process.env;

const sleep = (ms) => (
  new Promise((resolve, reject) => setTimeout(resolve, ms))
);

const insertMatchDetail = async (gameId) => {
  const result = await callApi(`/match/v4/matches/${gameId}`);
  await MatchDetail.create(result)
  // FIXME: remove later
  await sleep(100); 
}

const getMatches = async (accountId, queue, beginIndex, timestamp) => {
  const result = await callApi(
    `/match/v4/matchlists/by-account/${accountId}`,
    {
      queue,
      beginIndex,
    }
  );

  console.log('>>> timestamp', timestamp);

  const newMatches = result.matches.filter(m => !timestamp || m.timestamp > timestamp);

  console.log('>>> newMatches', newMatches.length);

  if(newMatches.length === 0) {
    return await Match.find({timestamp: {$lte: timestamp}});
  }

  await Match.insertMany(newMatches)
  await SummonerMatch.insertMany(newMatches.map(m => ({
    accountId,
    gameId: m.gameId,
    timestamp: m.timestamp,
  })));
  for(let i = 0; i < newMatches.length; i++) {
    await insertMatchDetail(newMatches[i].gameId);
  }

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
    const lastSummonerMatch = await SummonerMatch
      .find({accountId: req.params.accountId})
      .sort({timestamp: -1})
      .limit(1);

    await getMatches(
      req.params.accountId,
      req.query.queue,
      0,
      lastSummonerMatch[0] && lastSummonerMatch[0].timestamp
    );

    const summonerMatches = await SummonerMatch
      .find({accountId: req.params.accountId});

    const matchDetails = await MatchDetail
      .find({gameId: summonerMatches.map(m => m.gameId)});

    res.json(matchDetails);

  } catch(e) {
    console.error(e);
    res.json(e);
  }
});

export default router;
