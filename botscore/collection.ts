import type {HydratedDocument, Types} from 'mongoose';
import type {Botscore} from './model';
import BotscoreModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore botscores
 * stored in MongoDB, including adding, finding, and deleting botscores.
 */
class BotscoreCollection {
  /**
   * Add a botscore to the collection
   *
   * @param {string} userId - The id of the user
   * @param {number} score - The botscore of the user
   * @param {number} threshold - The botscore threshold specified by user
   * @return {Promise<HydratedDocument<Botscore>>} - The newly created botscore
   */
  static async addOne(
    userId: Types.ObjectId | string, score: number, threshold: number
  ): Promise<HydratedDocument<Botscore>> {
    const botscore = new BotscoreModel({userId, score, threshold});
    await botscore.save(); // Saves botscore to MongoDB
    return botscore.populate('userId');
  }

  /**
   * Find the botscore by botscoreId
   *
   * @param {string} botscoreId - The id of the botscore to find
   * @return {Promise<HydratedDocument<Botscore>> | Promise<null> } - The botscore with the given botscoreId, if any
   */
  static async findOne(botscoreId: Types.ObjectId | string): Promise<HydratedDocument<Botscore>> {
    return BotscoreModel.findOne({_id: botscoreId}).populate('userId');
  }

  /**
   * Get all the botscores in the database
   *
   * @return {Promise<HydratedDocument<Botscore>[]>} - An array of all of the botscores
   */
  static async findAll(): Promise<Array<HydratedDocument<Botscore>>> {
    return BotscoreModel.find({}).populate('userId');
  }

  /**
   * Get the botscore by username
   *
   * @param {string} username - The username that 'owns' the botscore
   * @return {Promise<HydratedDocument<Botscore>>} - The unique botscore
   */
  static async findOneByUsername(username: string): Promise<HydratedDocument<Botscore>> {
    const user = await UserCollection.findOneByUsername(username);
    return BotscoreModel.findOne({userId: user._id}).populate('userId');
  }

  /**
   * Update a botscore with new score and/or threshold
   *
   * @param {string} botscoreId - The id of the botscore to be updated
   * @param {string} score - The new score associated with the user
   * @param {string} threshold - The new threshold percentage
   * @return {Promise<HydratedDocument<Botscore>>} - The newly updated botscore
   */
  static async updateOne(
    botscoreId: Types.ObjectId | string,
    score?: number,
    threshold?: number
  ): Promise<HydratedDocument<Botscore>> {
    const botscore = await BotscoreModel.findOne({_id: botscoreId});
    if (score !== undefined) {
      botscore.score = score;
    }

    if (threshold !== undefined) {
      botscore.threshold = threshold;
    }

    await botscore.save();
    return botscore.populate('userId');
  }

  /**
   * Delete a botscore with given botscoreId.
   *
   * @param {string} botscoreId - The botscoreId of botscore to delete
   * @return {Promise<Boolean>} - true if the botscore has been deleted, false otherwise
   */
  static async deleteOne(botscoreId: Types.ObjectId | string): Promise<boolean> {
    const botscore = await BotscoreModel.deleteOne({_id: botscoreId});
    return botscore !== null;
  }

  /**
   * Delete all the botscores by a user
   *
   * @param {string} userId - The id of user that botscored items
   */
  static async deleteMany(userId: Types.ObjectId | string): Promise<void> {
    await BotscoreModel.deleteMany({userId});
  }
}

export default BotscoreCollection;
