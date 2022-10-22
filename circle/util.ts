import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Circle, PopulatedCircle} from '../circle/model';

// Update this if you add a property to the Circle type!
type CircleResponse = {
  _id: string;
  creator: string;
  name: string;
  members: string[];
  totalMembers: number;
};

/**
 * Transform a raw Circle object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Circle>} circle - A circle
 * @returns {CircleResponse} - The circle object formatted for the frontend
 */
const constructCircleResponse = (circle: HydratedDocument<Circle>): CircleResponse => {
  const circleCopy: PopulatedCircle = {
    ...circle.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = circleCopy.creatorId;
  const members = circleCopy.membersId.map(user => user.username);
  delete circleCopy.creatorId;
  delete circleCopy.membersId;

  return {
    ...circleCopy,
    _id: circleCopy._id.toString(),
    creator: username,
    members,
    totalMembers: members.length
  };
};

export {
  constructCircleResponse
};
