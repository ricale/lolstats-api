import SummonerMatch from '../../../schema/summonerMatches';
import Match from '../../../schema/matches';
import MatchDetail from '../../../schema/matchDetails';

import callApi from '../../../utils/callApi';

const getMatchDetail = async (gameId) => {
  const {body} = await callApi(`/match/v4/matches/${gameId}`);
  return body;
}

const fetchAndInsertMatchData = async (accountId, matches) => {
  const newMatches = [];
  const newMatchDetails = [];
  const newSummonerMatches = [];
  for(let i = 0; i < matches.length; i++) {
    let existedSummonerMatch = await SummonerMatch.findOne({accountId, gameId: matches[i].gameId});
    if(!existedSummonerMatch) {
      newSummonerMatches.push({
        accountId,
        gameId: matches[i].gameId,
        queueId: matches[i].queue,
        timestamp: matches[i].timestamp,
      });

      let existedMatch = await Match.findOne({gameId: matches[i].gameId});
      if(!existedMatch) {
        newMatches.push(matches[i]);
        newMatchDetails.push(await getMatchDetail(matches[i].gameId));
      }
    }
  }

  await Match.insertMany(newMatches);
  await MatchDetail.insertMany(newMatchDetails);
  await SummonerMatch.insertMany(newSummonerMatches);
}

const fetchMatches = async (accountId, queue, season, beginIndex, gameCount) => {
  const summonerMatchCount = await SummonerMatch
    .find({accountId, queueId: queue})
    .count();

  // if(summonerMatchCount >= gameCount) {
  //   return;
  // }

  const {body: result} = await callApi(
    `/match/v4/matchlists/by-account/${accountId}`,
    {
      queue,
      season,
      beginIndex,
    }
  );

  if(result.matches.length === 0) {
    return;
  }

  if(result.totalGames === summonerMatchCount) {
    return;
  }

  await fetchAndInsertMatchData(accountId, result.matches);

  await fetchMatches(accountId, queue, season, beginIndex + 100);
}

export default fetchMatches;
