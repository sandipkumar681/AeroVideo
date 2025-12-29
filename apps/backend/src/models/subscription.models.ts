import mongoose, { model } from "mongoose";
import { ISubscriptionDocument, ISubscriptionModel } from "@aerovideo/types";

// -----------------------------
// 1. Schema
// -----------------------------
const subscriptionSchema = new mongoose.Schema<ISubscriptionDocument>(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// -----------------------------
// 2. Export
// -----------------------------
export const Subscription = model<ISubscriptionDocument, ISubscriptionModel>(
  "Subscription",
  subscriptionSchema
);
