import type {HydratedDocument, Types} from 'mongoose';
import type {Like} from './model';
import LikeModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore likes
 * stored in MongoDB, including adding, finding, and deleting likes.
 */
class LikeCollection {
  /**
   * Add a like to the collection
   *
   * @param {string} freetId - The id of the freet
   * @param {string} userId - The id of the user
   * @return {Promise<HydratedDocument<Like>>} - The newly created like
   */
  static async addOne(
    freetId: Types.ObjectId | string,
    userId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    const like = new LikeModel({
      freetId,
      userId
    });
    await like.save(); // Saves like to MongoDB
    return like.populate('freetId userId');
  }

  /**
   * Find a like by likeId
   *
   * @param {string} likeId - The id of the like to find
   * @return {Promise<HydratedDocument<Like>> | Promise<null> } - The like with the given likeId, if any
   */
  static async findOne(likeId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    return LikeModel.findOne({_id: likeId}).populate('freetId userId');
  }

  /**
   * Get all the likes in the database
   *
   * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the likes
   */
  static async findAll(): Promise<Array<HydratedDocument<Like>>> {
    return LikeModel.find({}).populate('freetId userId');
  }

  /**
   * Get all the likes by username
   *
   * @param {string} username - The username of liker of the likes
   * @return {Promise<HydratedDocument<Like>[]>} - An array of likes
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Like>>> {
    const user = await UserCollection.findOneByUsername(username);
    return LikeModel.find({userId: user._id}).populate('freetId userId');
  }

  /**
   * NOTE: No UPDATE method because like objects should only be created upon a
   *  Like dealing with one post with one user, and deleted when unLiked.
   */

  /**
   * Delete a like with given likeId.
   *
   * @param {string} likeId - The likeId of like to delete
   * @return {Promise<Boolean>} - true if the like has been deleted, false otherwise
   */
  static async deleteOne(likeId: Types.ObjectId | string): Promise<boolean> {
    const like = await LikeModel.deleteOne({_id: likeId});
    return like !== null;
  }

  /**
   * Delete all the likes by a user
   *
   * @param {string} userId - The id of user that liked items
   */
  static async deleteMany(userId: Types.ObjectId | string): Promise<void> {
    await LikeModel.deleteMany({userId});
  }
}

export default LikeCollection;
