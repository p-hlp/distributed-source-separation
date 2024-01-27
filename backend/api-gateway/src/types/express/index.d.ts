import { User } from "@prisma/client";
import { AuthResult } from "express-oauth2-jwt-bearer";

declare module "express" {
  interface Request {
    auth?: AuthResult;
    user?: User;
  }
}
