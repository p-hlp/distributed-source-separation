import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import mime from "mime-types";
import { v4 as uuid } from "uuid";
import { prisma } from "./lib";
import { initMinioDefaultBucket, minioClient } from "./lib/minio";
import { processQueue, processQueueEvents } from "./lib/queue";
import { authenticate, createOrAddUser } from "./middleware";
import { RawFile, getFileType, parseMultipartReq } from "./shared/httpUtils";

const port = process.env.PORT;

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
    const extension = mime.extension(rawFile.info.mimeType);
    const objectKey = uuid();
    const fileName = `${user.id}/${objectKey}.${extension}`;
    const response = await minioClient.putObject(
      process.env.MINIO_DEFAULT_BUCKET || "audio",
      fileName,
      rawFile.data,
      undefined,
      rawFile.info
    );
    if (response instanceof Error) {
      return res.status(500).json({ message: "Error uploading file" });
    }

    const fileType = getFileType(rawFile.info.mimeType);
    if (!fileType)
      return res.status(400).json({ message: "Unsupported file type" });

    const audio = await prisma.audioFile.create({
      data: {
        name: rawFile.info.filename,
        filePath: fileName,
        fileType: fileType,
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
        parentId: null,
      },
      include: {
        stems: true,
      },
    });
    res.status(200).send(files);
  });

  app.get("/:userId/:object", (req: Request, res: Response) => {
    const user = req.user;
    const userId = req.params.userId;
    const objectName = req.params.object;
    if (!userId || !objectName)
      res.status(400).send("Path must be of the form /:userId/:object");
    if (!user) res.status(401).send("Unauthorized");

    const filePath = `${userId}/${objectName}`;

    minioClient.getObject(
      process.env.MINIO_DEFAULT_BUCKET || "audio",
      filePath,
      (err, stream) => {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        stream.pipe(res);
      }
    );
  });

  /**
   * This endpoint returns a signed url for the object
   * Allows the client to download/stream the object directly from minio
   * The url is valid for 24 hours
   */
  app.get("/signed/:userId/:object", (req: Request, res: Response) => {
    const user = req.user;
    const userId = req.params.userId;
    const objectName = req.params.object;
    if (!userId || !objectName)
      res.status(400).send("Path must be of the form /:userId/:object");
    if (!user) res.status(401).send("Unauthorized");

    const filePath = `${userId}/${objectName}`;

    const expiry = 60 * 60 * 24;
    minioClient.presignedUrl(
      "GET",
      process.env.MINIO_DEFAULT_BUCKET || "audio",
      filePath,
      expiry,
      (err, url) => {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        res.status(200).json({ url });
      }
    );
  });

  app.delete("/files/:id", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;
    const audio = await prisma.audioFile.findUnique({
      where: {
        id,
      },
    });
    if (!audio) return res.status(404).json({ message: "File not found" });
    if (audio.userId !== user.id)
      return res.status(401).json({ message: "Unauthorized" });

    await prisma.audioFile.delete({
      where: {
        id,
      },
    });
    res.status(200).json({ id, message: "File deleted" });
  });

  /**
   * This endpoint accepts an audioFileId and returns the added job Id
   */
  app.post("/separate", async (req: Request, res: Response) => {
    const jobPayload = {
      userId: req.user?.id,
      audioFileId: req.body.data,
    };
    console.log("separate jobPayload", jobPayload);
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
