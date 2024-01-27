import { User } from "@prisma/client";
import { Request } from "express";
import { AuthResult } from "express-oauth2-jwt-bearer";

export interface AuthenticatedRequest extends Request {
  auth: AuthResult;
  user?: User;
}
