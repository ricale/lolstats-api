import mongoose from 'mongoose';

const {Schema} = mongoose;
const summonerSchema = new Schema({
  accountId: {
    type: String,
  },
  userId: {
    type: String,
  },
  name: {
    type: String,
  },
  profileIconId: {
    type: Number,
  },
  puuid: {
    type: String,
  },
  revisionDate: {
    type: Number,
  },
  summonerLevel: {
    type: Number,
  },
  lastMatchId: {
    type: Number
  },
});

export default mongoose.model('Summoner', summonerSchema);
