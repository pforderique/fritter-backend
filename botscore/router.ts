import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import BotscoreCollection from './collection';
import UserCollection from '../user/collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as botscoreValidator from '../botscore/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the botscores
 *
 * @name GET /api/botscores
 *
 * @return {BotscoreResponse[]} - A list of all the botscores sorted in descending
 *                      order by date modified
 */
/**
 * Get botscores by username.
 *
 * @name GET /api/botscores?username=USERNAME
 *
 * @return {BotscoreResponse[]} - An array of botscores botscored by user with username `username`
 * @throws {400} - If username is not given
 * @throws {404} - If no user has given USERNAME
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if username query parameter was supplied
    if (req.query.username !== undefined) {
      next();
      return;
    }

    const allBotscores = await BotscoreCollection.findAll();
    const response = allBotscores.map(util.constructBotscoreResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isUsernameExists
  ],
  async (req: Request, res: Response) => {
    console.log('username given:', req.query.username);
    const userBotscore = await BotscoreCollection.findOneByUsername(req.query.username as string);
    console.log('Botscore obj:', userBotscore);
    const response = util.constructBotscoreResponse(userBotscore);
    res.status(200).json(response);
  }
);

/**
 * Create a new botscore.
 *
 * @name POST /api/botscores
 *
 * @param {string} score - The score of the user
 * @param {string} threshold - The threshold of the user
 * @return {BotscoreReponse} - The created botscore
 * @throws {400} - If the score/threshold does not exist
 * @throws {400} - If the score/threshold does not exist in range [0, 100]
 * @throws {403} - If the user is not logged in
 * @throws {409} - If the user already has a botscore
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    botscoreValidator.isPercentages
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const score = req.body.score as number; // Same ^
    const threshold = req.body.threshold as number; // Same ^

    const alreadyExists = await BotscoreCollection.findOneByUsername(req.session.username);
    if (alreadyExists) {
      return res.status(409).json({
        conflictError: `User ${req.session.username as string} already has a Botscore.`
      });
    }

    const botscore = await BotscoreCollection.addOne(userId, score, threshold);

    res.status(201).json({
      message: 'Your botscore was created successfully.',
      botscore: util.constructBotscoreResponse(botscore)
    });
  }
);

/**
 * DELETE not included because user or admin should never have to delete
 * a users botscore. This should be cleared automatically only when a
 * user is deleted.
 */

/**
 * Modify a botscore
 *
 * @name PUT /api/botscores/:botscoreId
 *
 * @param {string} score - The score of the user
 * @param {string} threshold - The threshold of the user
 * @return {BotscoreResponse} - the updated freet
 * @throws {400} - If score/threshold given, but outside range [0, 100]
 * @throws {403} - If the user is not logged in or not the one assigned this botscore
 * @throws {403} - If a non-admin user tries to modify any user's score attribute
 */
router.put(
  '/:botscoreId?',
  [
    userValidator.isUserLoggedIn,
    botscoreValidator.isBotscoreExists,
    botscoreValidator.isPercentages
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const botscore = await BotscoreCollection.findOne(req.params.botscoreId);
    if (req.body.threshold) {
      if (req.session.userId !== botscore.userId._id.toString()) {
        return res.status(404).json({
          error: {
            botscoreDoesNotBelongToUser: `Cannot change threshold. Botscore with botscore ID ${req.params.botscoreId} did not belong to signed in user, ${req.session.username as string}.`
          }
        });
      }

      botscore.threshold = req.body.threshold as number;
      await botscore.save();
    }

    if (req.body.score) {
      next();
      return;
    }

    res.status(200).json({
      message: 'Your botscore was updated successfully.',
      botscore: util.constructBotscoreResponse(botscore)
    });
  },
  [
    userValidator.isAdminUser
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const botscore = await BotscoreCollection.findOne(req.params.botscoreId);
    botscore.score = req.body.score as number;

    await botscore.save();
    const {username} = await UserCollection.findOneByUserId(botscore.userId);
    res.status(200).json({
      message: `${username}'s botscore was updated successfully.`,
      botscore: util.constructBotscoreResponse(botscore)
    });
  }
);

export {router as botscoreRouter};
