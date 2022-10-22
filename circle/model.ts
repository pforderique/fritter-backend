import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Circle
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Circle on the backend
export type Circle = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  creatorId: Types.ObjectId;
  name: string;
  membersId: Types.ObjectId[];
};

export type PopulatedCircle = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  creatorId: User;
  name: string;
  membersId: User[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Circles stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const CircleSchema = new Schema<Circle>({
  // Creator of circle
  creatorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Name of the circle
  name: {
    type: String,
    required: true
  },
  membersId: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    required: true
  }
});

const CircleModel = model<Circle>('Circle', CircleSchema);
export default CircleModel;
