import express from 'express';

import Summoner from '../../schema/summoners';
import SummonerMatch from '../../schema/summonerMatches';
import Match from '../../schema/matches';
import MatchDetail from '../../schema/matchDetails';

import callApi from '../../utils/callApi';

import {fetchMatches} from './commons';

const router = express.Router();

const {HOST, TOKEN} = process.env;

const getDetailsByChamp = (accountId, matchDetails) => {
  const matchDetailsByAccountId = matchDetails
    .filter(d => d.gameDuration >= 60 * 10)
    .map(d => {
      const identity = d.participantIdentities.filter(i =>
        i.player.accountId === accountId
      )[0];
      const participant = d.participants.filter(p =>
        p.participantId === identity.participantId
      )[0];
      const team = d.teams.filter(t => t.teamId === participant.teamId)[0];
      return {team, participant};
    });

  const detailsByChamp = matchDetailsByAccountId.reduce((acc,d) => {
    const {championId, spell1Id, spell2Id, stats} = d.participant
    if(!acc[championId]) {
      acc[championId] = {
        championId,
        game: 0,
        win: 0,
        lose: 0,
        spells: {},
        stats: {
          kills: 0,
          deaths: 0,
          assists: 0,
          doubleKills: 0,
          tripleKills: 0,
          quadraKills: 0,
          pentaKills: 0,
          totalDamageDealtToChampions: 0,
          totalHeal: 0,
          visionScore: 0,
          totalDamageTaken: 0,
          goldEarned: 0,
          totalMinionsKilled: 0,
          visionWardsBoughtInGame: 0,
          wardsPlaced: 0,
          wardsKilled: 0,
        }
      };
    }


    acc[championId].game += 1;
    if(stats.win) {
      acc[championId].win += 1;        
    } else {
      acc[championId].lose += 1;
    }

    acc[championId].spells[spell1Id] || (acc[championId].spells[spell1Id] = 0);
    acc[championId].spells[spell1Id] += 1;
    acc[championId].spells[spell2Id] || (acc[championId].spells[spell2Id] = 0);
    acc[championId].spells[spell2Id] += 1;

    Object.keys(acc[championId].stats).forEach(key => {
      acc[championId].stats[key] += stats[key];
    });

    return acc;

  }, {});

  return Object.keys(detailsByChamp).map(championId =>
    detailsByChamp[championId]
  ).sort((a,b) => b.game - a.game);
}

router.get('/:accountId/', async (req, res) => {
  try {
    const summoner = await Summoner.findOne({accountId: req.params.accountId});

    const {body: entryResult} = await callApi(`/league/v4/entries/by-summoner/${summoner.userId}`);
    const {wins, losses} = entryResult.filter(e => e.queueType === 'RANKED_SOLO_5x5')[0];
    const gameCount = wins + losses;

    await fetchMatches(
      req.params.accountId,
      req.query.queue,
      13, // season
      0,
      gameCount
    );

    const summonerMatches = await SummonerMatch
      .find({accountId: req.params.accountId});

    const matchDetails = await MatchDetail
      .find({gameId: summonerMatches.map(m => m.gameId)});

    const detailsByChamp = getDetailsByChamp(req.params.accountId, matchDetails);

    res.json(detailsByChamp);

  } catch(e) {
    console.error(e);
    res.json(e);
  }
});

export default router;
