const data = require('../static/9.3.1/data/ko_KR/champion.json');
const championData = data.data;

const champions = Object.keys(championData).reduce((acc, key) => {
  acc.push(championData[key]);
  return acc;
}, []);

const sorted = champions.sort((a,b) =>
  parseInt(a.key, 10) - parseInt(b.key, 10)
);

module.exports = sorted;
