import mongoose from 'mongoose';

const {Schema} = mongoose;
const matchDetailSchema = new Schema({
  seasonId: {
    type: Number,
  },
  queueId: {
    type: Number,
  },
  gameId: {
    type: Number,
  },
  participantIdentities: {
    type: Array,
  },
  gameVersion: {
    type: String,
  },
  platformId: {
    type: String,
  },
  gameMode: {
    type: String,
  },
  mapId: {
    type: Number,
  },
  gameType: {
    type: String,
  },
  teams: {
    type: Array,
  },
  participants: {
    type: Array,
  },
  gameDuration: {
    type: Number,
  },
  gameCreation: {
    type: Number,
  },
});

export default mongoose.model('MatchDetail', matchDetailSchema);
