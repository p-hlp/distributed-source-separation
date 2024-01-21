import express from "express";

export const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.status(200).json("Hello from API Gateway");
});

export const registerApiRoutes = (app: express.Express) => {
  app.use("/api", apiRouter);
};
