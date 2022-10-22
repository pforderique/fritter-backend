import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import * as userValidator from '../user/middleware';
import CircleCollection from './collection';

/**
 * Checks if a Circle with circleId in req.params exists
 */
const isCircleExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.circleId);
  const circle = validFormat ? await CircleCollection.findOne(req.params.circleId) : '';
  if (!circle) {
    res.status(404).json({
      error: {
        circleNotFound: `Circle with circle ID ${req.params.circleId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a circleId "belongs" to signed in user
 */
const isCirlceBelongToUser = async (req: Request, res: Response, next: NextFunction) => {
  const circle = await CircleCollection.findOne(req.params.circleId);
  if (circle.creatorId._id.toString() !== req.session.userId) {
    res.status(403).json({
      error: {
        circleDoesNotBelongToUser: `Circle with like ID ${req.params.circleId} did not belong to signed in user, ${req.session.username as string}.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a circle contains nonempty name parameter in the body
 */
const isNameNonEmpty = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.name === undefined) {
    res.status(400).json({
      error: {
        message: 'No name given.'
      }
    });
    return false;
  }

  if (req.body.name === '') {
    res.status(400).json({
      error: {
        message: 'Name cannot be empty string.'
      }
    });
    return false;
  }

  next();
  return true;
};

/**
 * Checks if the memberids field exist and is non empty
 */
const isMembersNonEmpty = async (req: Request, res: Response, next: NextFunction) => {
  const {membersId} = req.body as {membersId: string};
  console.log('membersId', membersId);
  if (!membersId || !membersId.trim().split(',').filter(id => id)) {
    res.status(400).json({
      error: 'No member ids specified.'
    });
    return;
  }

  next();
};

/**
 * Checks if each member in members exist
 */
const isMembersExist = async (req: Request, res: Response, next: NextFunction) => {
  const {membersId} = req.body as {membersId: string};
  const ids: string[] = membersId.trim().split(',').filter(id => id);

  for (const id of ids) {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: `"${id}" is an invalid ID type.`
      });
    }
  }

  const findings = await Promise.all(ids.map(
    async id => UserCollection.findOneByUserId(id)));

  if (findings.some(res => !res)) {
    res.status(404).json({
      error: 'Some user in group does not exist.'
    });
    return;
  }

  next();
};

export {
  isCircleExists,
  isCirlceBelongToUser,
  isNameNonEmpty,
  isMembersExist,
  isMembersNonEmpty
};
