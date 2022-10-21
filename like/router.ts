import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import LikeCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as likeValidator from '../like/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the likes
 *
 * @name GET /api/likes
 *
 * @return {LikeResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get likes by username.
 *
 * @name GET /api/likes?username=USERNAME
 *
 * @return {LikeResponse[]} - An array of likes liked by user with username `username`
 * @throws {400} - If username is not given
 * @throws {404} - If no user has given USERNAME
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if userId query parameter was supplied
    if (req.query.username !== undefined) {
      next();
      return;
    }

    const allLikes = await LikeCollection.findAll();
    const response = allLikes.map(util.constructLikeResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isUsernameExists
  ],
  async (req: Request, res: Response) => {
    const userLikes = await LikeCollection.findAllByUsername(req.query.username as string);
    const response = userLikes.map(util.constructLikeResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new like.
 *
 * @name POST /api/likes
 *
 * @param {string} freetId - The id of the freet to like in the body
 * @return {LikeReponse} - The created like
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet does not exist
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    likeValidator.isFreetExists
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freetId = (req.body.freetId as string) ?? ''; // Same ^
    const like = await LikeCollection.addOne(freetId, userId);

    res.status(201).json({
      message: 'Your like was created successfully.',
      like: util.constructLikeResponse(like)
    });
  }
);

/**
 * Delete a like
 *
 * @name DELETE /api/likes/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the likeId is not valid
 */
router.delete(
  '/:likeId?',
  [
    userValidator.isUserLoggedIn,
    likeValidator.isLikeExists,
    likeValidator.isLikeBelongToUser
  ],
  async (req: Request, res: Response) => {
    await LikeCollection.deleteOne(req.params.likeId);
    res.status(200).json({
      message: 'Your like was deleted successfully.'
    });
  }
);

export {router as likeRouter};
