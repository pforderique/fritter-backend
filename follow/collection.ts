import type {HydratedDocument, Types} from 'mongoose';
import type {Follow} from './model';
import FollowModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore Follows
 * stored in MongoDB, including adding, finding, and deleting Follows.
 */
class FollowCollection {
  /**
   * Add a Follow to the collection
   *
   * @param {string} followerId - The id of the follower
   * @param {string} followingId - The id of the user being followed
   * @return {Promise<HydratedDocument<Follow>>} - The newly created Follow
   */
  static async addOne(
    followerId: Types.ObjectId | string,
    followingId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    const Follow = new FollowModel({
      followerId,
      followingId
    });
    await Follow.save(); // Saves Follow to MongoDB
    return Follow.populate('followerId followingId');
  }

  /**
   * Find a Follow by FollowId
   *
   * @param {string} FollowId - The id of the Follow to find
   * @return {Promise<HydratedDocument<Follow>> | Promise<null> } - The Follow with the given FollowId, if any
   */
  static async findOne(FollowId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    return FollowModel.findOne({_id: FollowId}).populate('followerId followingId');
  }

  /**
   * Get all the Follows in the database
   *
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the Follows
   */
  static async findAll(): Promise<Array<HydratedDocument<Follow>>> {
    return FollowModel.find({}).populate('followerId followingId');
  }

  /**
   * Get all the Follows by follower username
   *
   * @param {string} username - The username of Follower of the Follow
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of Follows
   */
  static async findAllByFollower(username: string): Promise<Array<HydratedDocument<Follow>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FollowModel.find({followerId: user._id}).populate('followerId followingId');
  }

  /**
   * Get all the Follows by followee username
   *
   * @param {string} username - The username of followee of the Follow
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of Follows
   */
  static async findAllByFollowee(username: string): Promise<Array<HydratedDocument<Follow>>> {
    const user = await UserCollection.findOneByUsername(username);
    return FollowModel.find({followingId: user._id}).populate('followerId followingId');
  }

  /**
   * Get all the Follows by followee username
   *
   * @param {string} follower - The username of follower of the Follow
   * @param {string} followee - The username of followee of the Follow
   *  Both params allowed to be the empty string (will return )
   * @return {Promise<HydratedDocument<Follow>>} - A Follow
   */
  static async findByPair(follower: string, followee: string): Promise<HydratedDocument<Follow>> {
    const [followerUser, followeeUser] = await Promise.all([
      UserCollection.findOneByUsername(follower),
      UserCollection.findOneByUsername(followee)
    ]);
    return FollowModel.findOne({
      followerId: followerUser._id,
      followingId: followeeUser._id
    }).populate('followerId followingId');
  }

  /**
   * NOTE: No UPDATE method because Follow objects should only be created upon a
   *  Follow dealing with one user with one user, and deleted when unFollowed.
   */

  /**
   * Delete a Follow with given FollowId.
   *
   * @param {string} FollowId - The FollowId of freet to delete
   * @return {Promise<Boolean>} - true if the Follow has been deleted, false otherwise
   */
  static async deleteOne(FollowId: Types.ObjectId | string): Promise<boolean> {
    const Follow = await FollowModel.deleteOne({_id: FollowId});
    return Follow !== null;
  }

  /**
   * Delete a Follow with given username of followee.
   *
   * @param {string} username - The username of followee
   * @return {Promise<Boolean>} - true if the Follow has been deleted, false otherwise
   */
  static async deleteByUsername(username: string): Promise<boolean> {
    const user = await UserCollection.findOneByUsername(username);
    const Follow = await FollowModel.deleteOne({followingId: user._id});
    return Follow !== null;
  }

  /**
   * Delete all the Follows associated with the user with ID userId
   *
   * @param {string} userId - The id of user
   */
  static async deleteMany(userId: Types.ObjectId | string): Promise<boolean> {
    const results = await Promise.all([
      FollowModel.deleteMany({followerId: userId}),
      FollowModel.deleteMany({followingId: userId})
    ]);
    return results.every(res => res === null);
  }
}

export default FollowCollection;
