import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import LikeCollection from './collection';

/**
 * Checks if a like with freetId in req.params exists
 */
const isLikeExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.likeId);
  const like = validFormat ? await LikeCollection.findOne(req.params.likeId) : '';
  if (!like) {
    res.status(404).json({
      error: {
        likeNotFound: `Like with like ID ${req.params.likeID} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a likeId "belongs" to signed in user
 */
const isLikeBelongToUser = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findOne(req.params.likeId);
  console.log(`person who liked: ${like.userId._id.toString()}`);
  console.log(`person siged in: ${req.session.userId as string}`);
  if (like.userId._id.toString() !== req.session.userId) {
    res.status(404).json({
      error: {
        likeDoesNotBelongToUser: `Like with like ID ${req.params.likeId} did not belong to signed in user, ${req.session.username as string}.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a freet with freetId in req.body exists
 */
const isFreetExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.body.freetId);
  const like = validFormat ? await FreetCollection.findOne(req.body.freetId) : '';
  if (!like) {
    res.status(404).json({
      error: {
        freetNotFound: `Freet with freet ID ${req.body.freetId as string} does not exist.`
      }
    });
    return;
  }

  next();
};

export {
  isLikeExists,
  isFreetExists,
  isLikeBelongToUser
};
