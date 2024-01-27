import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import axios from "axios";
import { Queue, QueueEvents } from "bullmq";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { v4 as uuid } from "uuid";
import { prisma } from "./lib";
import { initMinioDefaultBucket, minioClient } from "./lib/minio";
import { authenticate, createOrAddUser } from "./middleware";
import { RawFile, parseMultipartReq } from "./shared/httpUtils";
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
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    if (!req.body) res.status(400).json({ message: "No data to upload" });

    const rawFile: RawFile = (await parseMultipartReq(req))[0];
    const objectKey = uuid();
    const fileName = `${user.id}/${objectKey}`;
    const response = await minioClient.putObject(
      process.env.MINIO_DEFAULT_BUCKET || "audio",
      fileName,
      rawFile.data,
      undefined
    );
    if (response instanceof Error) {
      return res.status(500).json({ message: "Error uploading file" });
    }

    // store file with information and user association
    const audio = await prisma.audioFile.create({
      data: {
        name: rawFile.info.filename,
        filePath: fileName,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    res.status(200).json({ audio });
  });

  app.get("/files", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const files = await prisma.audioFile.findMany({
      where: {
        userId: user.id,
      },
    });
    res.status(200).json({ files });
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
