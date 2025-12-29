import { IUserDocument } from "@aerovideo/types";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export type AuthenticatedRequest = Request & { user: IUserDocument };

export interface DecodedToken extends JwtPayload {
  _id: string;
}
