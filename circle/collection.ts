import type {HydratedDocument} from 'mongoose';
import {Types} from 'mongoose';
import type {Circle} from './model';
import CircleModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore circles
 * stored in MongoDB, including adding, finding, updating, and deleting circles.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Circle> is the output of the CircleModel() constructor,
 * and contains all the information in Circle. https://mongoosejs.com/docs/typescript.html
 */
class CircleCollection {
  /**
   * Add a circle to the collection
   *
   * @param {string} creatorId - The id of the creator of the circle
   * @param {string} name - The name of the circle
   * @param {Array<string>} membersId - An array of string ids of members in the group
   * @return {Promise<HydratedDocument<Circle>>} - The newly created circle
   */
  static async addOne(
    creatorId: Types.ObjectId | string,
    name: string,
    membersId: Array<Types.ObjectId | string>
  ): Promise<HydratedDocument<Circle>> {
    const circle = new CircleModel({
      creatorId,
      name,
      membersId
    });
    await circle.save(); // Saves circle to MongoDB
    return circle.populate('creatorId membersId');
  }

  /**
   * Find a circle by circleId
   *
   * @param {string} circleId - The id of the circle to find
   * @return {Promise<HydratedDocument<Circle>> | Promise<null> } - The circle with the given circleId, if any
   */
  static async findOne(
    circleId: Types.ObjectId | string
  ): Promise<HydratedDocument<Circle>> {
    return CircleModel.findOne({_id: circleId}).populate('creatorId membersId');
  }

  /**
   * Get all the circles in the database
   *
   * @return {Promise<HydratedDocument<Circle>[]>} - An array of all of the circles
   */
  static async findAll(): Promise<Array<HydratedDocument<Circle>>> {
    // Retrieves circles and sorts them from most to least recent
    return CircleModel.find({}).populate('creatorId membersId');
  }

  /**
   * Get all the circles in by given creator
   *
   * @param {string} username - The username of creator of the circles
   * @return {Promise<HydratedDocument<Circle>[]>} - An array of all of the circles
   */
  static async findAllByCreator(username: string): Promise<Array<HydratedDocument<Circle>>> {
    const creator = await UserCollection.findOneByUsername(username);
    return CircleModel.find({creatorId: creator._id}).populate('creatorId membersId');
  }

  /**
   * Update a circle with the new name and members
   *
   * @param {string} circleId - The id of the circle to be updated
   * @param {string} name - The new name of the circle
   * @param {string} membersId - An array of ids to set members of circle
   * @return {Promise<HydratedDocument<Circle>>} - The newly updated circle
   */
  static async updateOne(
    circleId: Types.ObjectId | string,
    name?: string,
    membersId?: string[]
  ): Promise<HydratedDocument<Circle>> {
    const circle = await CircleModel.findOne({_id: circleId});
    if (name) {
      circle.name = name;
    }

    if (membersId) {
      console.log(membersId);
      const membersObjectIds = membersId.filter(
        id => typeof id === 'string' && Types.ObjectId.isValid(id)).map(
        id => typeof id === 'string' ? new Types.ObjectId(id) : id
      );
      console.log('membersObjectIds', membersObjectIds);
      circle.membersId = membersObjectIds;
    }

    await circle.save();
    return circle.populate('creatorId membersId');
  }

  /**
   * Delete a circle with given circleId.
   *
   * @param {string} circleId - The circleId of circle to delete
   * @return {Promise<Boolean>} - true if the circle has been deleted, false otherwise
   */
  static async deleteOne(circleId: Types.ObjectId | string): Promise<boolean> {
    const circle = await CircleModel.deleteOne({_id: circleId});
    return circle !== null;
  }

  /**
   * Delete all the circles by the given creator
   *
   * @param {string} creatorId - The id of creator of circles
   */
  static async deleteMany(creatorId: Types.ObjectId | string): Promise<void> {
    await CircleModel.deleteMany({creatorId});
  }
}

export default CircleCollection;
