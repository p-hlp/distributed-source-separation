import express from "express";
import { filesRouter } from "./files/files.router";
import { librariesRouter } from "./libraries";

export const apiRouter = express.Router();

apiRouter.use("/libraries", librariesRouter);
apiRouter.use("/filesV2", filesRouter);

export const registerApiRoutes = (app: express.Express) => {
  app.use("/api", apiRouter);
};
