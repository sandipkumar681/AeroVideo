import mongoose, { HydratedDocument, Model } from "mongoose";

export interface ISubscription {
  subscriber: mongoose.Types.ObjectId;
  channel: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Instance Methods (if needed in the future)
export interface ISubscriptionMethods {}

export type ISubscriptionDocument = HydratedDocument<
  ISubscription,
  ISubscriptionMethods
>;
export interface ISubscriptionModel
  extends Model<ISubscription, {}, ISubscriptionMethods> {}
