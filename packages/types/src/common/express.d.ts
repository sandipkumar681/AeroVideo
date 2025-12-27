import { IUserDocument } from "../user/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument | null;
    }
  }
}
