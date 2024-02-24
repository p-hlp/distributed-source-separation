import express from "express";
import { librariesRouter } from "./libraries";

export const apiRouter = express.Router();

apiRouter.use("/libraries", librariesRouter);

export const registerApiRoutes = (app: express.Express) => {
  app.use("/api", apiRouter);
};
