import { Request, Response } from "express";

export const errorIfNotAuthenticated = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).send("Unauthorized");
  }
};
