import mongoose, { HydratedDocument, Model } from "mongoose";

export interface IUser {
  userName: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage: string;
  password: string;
  watchHistory: {
    videoId: mongoose.Types.ObjectId;
    watchedAt: Date;
  }[];
  refreshToken?: string;
}

// Instance Methods

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export type IUserDocument = HydratedDocument<IUser, IUserMethods>;
export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

export interface RegisterBody
  extends Pick<IUser, "fullName" | "userName" | "email" | "password"> {
  otp: string;
}

export interface LoginBody extends Pick<IUser, "password"> {
  email: IUser["email"];
}

export interface changeCurrentPasswordBody {
  oldPassword: IUser["password"];
  newPassword: IUser["password"];
}

export interface changeAccountDetailsBody {
  userName: IUser["userName"];
  fullName: IUser["fullName"];
}

export interface resetPasswordBody {
  email: IUser["email"];
  otp: string;
  newPassword: IUser["password"];
}
