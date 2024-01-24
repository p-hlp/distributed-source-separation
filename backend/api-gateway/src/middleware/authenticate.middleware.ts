import { auth } from "express-oauth2-jwt-bearer";

export const authenticate = auth({
  audience: process.env.AUTH0_API_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});
