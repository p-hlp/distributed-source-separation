import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import axios from "axios";
import { Queue, QueueEvents } from "bullmq";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { authenticate } from "./middleware/authenticate.middleware";
import { processQueueName } from "./types";

const port = process.env.PORT;

export const processQueue = new Queue(processQueueName);
export const processQueueEvents = new QueueEvents(processQueueName);

export const axiosInstance = axios.create({
  baseURL: process.env.AUTH0_DOMAIN,
});

const app: Express = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(authenticate);

// registerApiRoutes(app);

processQueueEvents.on("completed", (result) => {
  console.log("Job completed - id", result.jobId);
  console.log("Job completed - result", result.returnvalue);
  // send result to client via. SSE
});

app.post("/queue", async (req, res) => {
  const userId = req.auth?.payload?.sub ?? "";
  const job = await processQueue.add("processData", req.body);
  res.status(200).send({ message: "Data added to queue", jobId: job.id });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
