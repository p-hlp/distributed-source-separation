import { NextFunction, Request, Response } from "express";

/**
 * Middleware to convert token query param to authorization header
 * Used for SSE connections since they do not allow modifying headers
 */
export const tokenParamToHeader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
    delete req.query.token;
    const url = req.originalUrl.split("?")[0];
    req.originalUrl = req.url;
    req.url = url;
  }
  next();
};
