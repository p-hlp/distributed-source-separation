import { auth } from "express-oauth2-jwt-bearer";
import { ENV } from "../types";

export const authenticate = auth({
  audience: ENV.AUTH0_API_AUDIENCE,
  issuerBaseURL: ENV.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});
