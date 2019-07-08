import express from 'express';

import Summoner from '../../schema/summoners';
import Match from '../../schema/matches';

import callApi from '../../utils/callApi';

const router = express.Router();

const {HOST, TOKEN} = process.env;

const geMatches = async (accountId, queue) => {
  const result = await callApi(
    `/match/v4/matchlists/by-account/${accountId}`,
    {queue}
  );
  
  const count = result.totalGames - result.endIndex;

  const mores = [];
  for(let i = 1; (i-1)*100 < count; i++) {
    mores.push(await callApi(
      `/match/v4/matchlists/by-account/${accountId}`,
      {
        queue,
        beginIndex: i*100,
      },
    ));
  }

  mores.forEach(m => {
    result.matches.push(...m.matches);
    result.endIndex = m.endIndex;
  });

  return result;
}

router.get('/:accountId/', async (req, res) => {
  try {
    // const summoner = await Summoner.findOne({accountId: req.params.accountId}).exec();
    const result = await geMatches(
      req.params.accountId,
      req.query.queue
    );
    res.json(result);

  } catch(e) {
    console.error('error', e);
    res.json(e);
  }
});

export default router;
