import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Botscore
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Botscore on the backend
export type Botscore = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userId: Types.ObjectId;
  score: number;
  threshold: number;
};

export type PopulatedBotscore = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userId: User;
  score: number;
  threshold: number;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Botscores stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const BotscoreSchema = new Schema<Botscore>({
  // The user associated with the botscore
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  score: {
    type: Number,
    min: [0, 'percentage must be >= 0%.'],
    max: [100, 'percentage must be <= 100%.']
  },
  threshold: {
    type: Number,
    min: [0, 'percentage must be >= 0%.'],
    max: [100, 'percentage must be <= 100%.']
  }
});

const BotscoreModel = model<Botscore>('Botscore', BotscoreSchema);
export default BotscoreModel;
