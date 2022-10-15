import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Like, PopulatedLike} from '../like/model';

type LikeResponse = {
  _id: string;
  user: string;
  freetId: string;
};

/**
 * Transform a raw Like object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Like>} like - A like
 * @returns {LikeResponse} - The like object formatted for the frontend
 */
const constructLikeResponse = (like: HydratedDocument<Like>): LikeResponse => {
  const likeCopy: PopulatedLike = {
    ...like.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = likeCopy.userId;
  delete likeCopy.userId;
  return {
    ...likeCopy,
    _id: likeCopy._id.toString(),
    user: username,
    freetId: likeCopy.freetId._id.toString()
  };
};

export {
  constructLikeResponse
};
