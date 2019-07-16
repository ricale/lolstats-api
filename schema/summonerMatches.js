import mongoose from 'mongoose';

const {Schema} = mongoose;
const summonerMatchSchema = new Schema({
  accountId: {
    type: String,
  },
  gameId: {
    type: Number,
  },
  timestamp: {
    type: Number,
  },
});

export default mongoose.model('SummonerMatch', summonerMatchSchema);
