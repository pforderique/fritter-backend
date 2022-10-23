import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Botscore, PopulatedBotscore} from '../botscore/model';

type BotscoreResponse = {
  _id: string;
  username: string;
  score: number;
  threshold: number;
};

/**
 * Transform a raw Botscore object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Botscore>} botscore - A botscore
 * @returns {BotscoreResponse} - The botscore object formatted for the frontend
 */
const constructBotscoreResponse = (botscore: HydratedDocument<Botscore>): BotscoreResponse => {
  const botscoreCopy: PopulatedBotscore = {
    ...botscore.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = botscoreCopy.userId;
  delete botscoreCopy.userId;
  return {
    ...botscoreCopy,
    _id: botscoreCopy._id.toString(),
    username
  };
};

export {
  constructBotscoreResponse
};
