import { NextFunction, Request, Response } from "express";

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
