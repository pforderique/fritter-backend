import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import BotscoreCollection from './collection';

/**
 * Checks if a botscore with freetId in req.params exists
 */
const isBotscoreExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.botscoreId);
  const botscore = validFormat ? await BotscoreCollection.findOne(req.params.botscoreId) : '';
  if (!botscore) {
    res.status(404).json({
      error: {
        botscoreNotFound: `Botscore with botscore ID ${req.params.botscoreID} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a botscoreId "belongs" to signed in user
 */
const isBotscoreBelongToUser = async (req: Request, res: Response, next: NextFunction) => {
  const botscore = await BotscoreCollection.findOne(req.params.botscoreId);
  if (botscore.userId._id.toString() !== req.session.userId) {
    res.status(404).json({
      error: {
        botscoreDoesNotBelongToUser: `Botscore with botscore ID ${req.params.botscoreId} did not belong to signed in user, ${req.session.username as string}.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if given score and/or threshold in body is a valid percentage
 */
const isPercentages = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.score && !isValidPercentage(req.body.score)) {
    return res.status(400).json({
      error: {
        message: `Botscore of ${req.body.score as string} is not a percentage.`
      }
    });
  }

  if (req.body.threshold && !isValidPercentage(req.body.threshold)) {
    return res.status(400).json({
      error: {
        message: `Threshold ${req.body.threshold as string} is not a percentage.`
      }
    });
  }

  next();
};

const isValidPercentage = (num: string | number): boolean => {
  let parsedNum: number;
  if (typeof num === 'string') {
    try {
      parsedNum = parseInt(num, 10);
    } catch {
      return false;
    }
  }

  return Number.isInteger(parsedNum) && parsedNum >= 0 && parsedNum <= 100;
};

export {
  isBotscoreExists,
  isBotscoreBelongToUser,
  isPercentages
};
