import mongoose from 'mongoose';

const {Schema} = mongoose;
const matchSchema = new Schema({
  gameId: {
    type: Number,
  },
  platformId: {
    type: String,
  },
  timestamp: {
    type: Number,
  },
  queue: {
    type: Number,
  },
  season: {
    type: Number
  }
});

export default mongoose.model('Match', matchSchema);
