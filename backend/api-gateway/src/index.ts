import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import cors from "cors";
import express, { Express } from "express";
import { registerApiRoutes } from "./api";
import { authenticate } from "./middleware/authenticate.middleware";
import helmet from "helmet";

const port = process.env.PORT;

const app: Express = express();
app.use(cors());
app.use(helmet());
app.use(authenticate);

registerApiRoutes(app);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
