import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import axios from "axios";
import { Queue, QueueEvents } from "bullmq";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { initMinioDefaultBucket } from "./lib/minio";
import { authenticate, createOrAddUser } from "./middleware";
import { processQueueName } from "./types";

const port = process.env.PORT;

export const processQueue = new Queue(processQueueName);
export const processQueueEvents = new QueueEvents(processQueueName);

export const axiosInstance = axios.create({
  baseURL: process.env.AUTH0_DOMAIN,
});

const startUp = async () => {
  const app: Express = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(authenticate);
  app.use(createOrAddUser);

  await initMinioDefaultBucket();

  // registerApiRoutes(app);
  processQueueEvents.on("completed", (result) => {
    console.log("Job completed - id", result.jobId);
    console.log("Job completed - result", result.returnvalue);
    // send result to client via. SSE
  });

  app.post("/upload", async (req: Request, res: Response) => {
    // Accepts audio files (.wav/.mp3) and uploads to Minio object storage and returns url to file storage
  });

  app.post("/queue", async (req: Request, res: Response) => {
    const jobPayload = {
      user: req.user,
      data: req.body.data,
    };
    const job = await processQueue.add("processData", jobPayload);
    res.status(200).json({ message: "Data added to queue", jobId: job.id });
  });

  app.get("/", async (req, res) => {
    res.status(200).json({ message: "Hello world" });
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};

startUp();
