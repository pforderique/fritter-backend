import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import UserCollection from '../user/collection';
import FollowCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as followValidator from './middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the follows
 *
 * @name GET /api/follows
 *
 * @return {FollowResponse[]} - A list of all the follows
 */
/**
 * Get follows by follower username.
 *
 * @name GET /api/follows?follower=USERNAME
 *
 * @return {FollowResponse[]} - An array of follows where the follower is `username`
 *
 */
/**
 * Get follows by followee username.
 *
 * @name GET /api/follows?followee=USERNAME
 *
 * @return {FollowResponse[]} - An array of follows where the followee is `username`
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.query.follower as string ?? '';
    const followee = req.query.followee as string ?? '';

    if (follower && followee) {
      const follow = await FollowCollection.findByPair(follower, followee);
      const response = util.constructFollowResponse(follow);
      return res.status(200).json(response);
    }

    if (follower) {
      const follows = await FollowCollection.findAllByFollower(follower);
      const response = follows.map(util.constructFollowResponse);
      return res.status(200).json(response);
    }

    if (followee) {
      const follows = await FollowCollection.findAllByFollowee(followee);
      const response = follows.map(util.constructFollowResponse);
      return res.status(200).json(response);
    }

    // No follower OR followee specified: return all follows.
    const allFollows = await FollowCollection.findAll();
    const response = allFollows.map(util.constructFollowResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new follow.
 *
 * @name POST /api/follows/:followee
 *
 * @param {string} followee - The username of the user to follow
 * @return {FollowReponse} - The created follow
 * @return {303} - If signed in user already following followee
 * @throws {400} - If no followee specified
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the followee does not exist
 */
router.post(
  '/:followee?',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const username = (req.session.username as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn

    const {followee} = req.params;
    if (!followee) {
      return res.status(400).json({
        error: 'no followee specified.'
      });
    }

    const followeeUser = await UserCollection.findOneByUsername(followee);
    if (!followeeUser) {
      return res.status(404).json({
        error: `username of followee (${followee}) does not exist.`
      });
    }

    const existingFollow = await FollowCollection.findByPair(username, followee);
    if (existingFollow) {
      return res.status(303).json({
        alreadyFollowing: `You already follow user ${followee}`
      });
    }

    const follow = await FollowCollection.addOne(userId, followeeUser._id);
    res.status(201).json({
      message: 'Your follow was created successfully.',
      follow: util.constructFollowResponse(follow)
    });
  }
);

/**
 * Delete a follow
 *
 * @name DELETE /api/follows/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 */
router.delete(
  '/:followId?',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    await FollowCollection.deleteOne(req.params.followId);
    res.status(200).json({
      message: 'Your follow was deleted successfully.'
    });
  }
);

export {router as followRouter};
