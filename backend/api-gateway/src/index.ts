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
import {
  audioToMidiQueue,
  audioToMidiQueueEvents,
  separateQueue,
  separateQueueEvents,
  transcribeQueue,
  transcribeQueueEvents,
} from "./lib/queue";
import { authenticate, createOrAddUser } from "./middleware";
import { tokenParamToHeader } from "./middleware/tokenParamToHeader.middleware";
import { generateWaveFormJson } from "./shared/fsUtils";
import { RawFile, getFileType, parseMultipartReq } from "./shared/httpUtils";

const port = process.env.PORT;

const sseConnections = new Map<string, Response>();

const sendEvent = (res: Response, data: EventResponse) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

type QueueJobStatus = "done" | "inProgress" | "failed";

enum EventType {
  separate = "separate",
  audioToMidi = "audioToMidi",
  transcribe = "transcribe",
  message = "message",
}

interface CompletedQueueResult {
  userId: string;
  audioFileId: string;
  status: QueueJobStatus;
  progress?: number;
}

type FailedQueueResult = CompletedQueueResult & { error: string };

interface EventResponse {
  type: EventType;
  status: QueueJobStatus;
  jobId?: string;
  audioFileId?: string;
  error?: string;
  message?: string;
}

const startUp = async () => {
  const app: Express = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(tokenParamToHeader);
  app.use(authenticate);
  app.use(createOrAddUser);

  await initMinioDefaultBucket();

  // registerApiRoutes(app);

  separateQueueEvents.on("completed", (result) => {
    console.log("Job completed - id", result.jobId);
    console.log("Job completed - result", result.returnvalue);
    const completedResult = result.returnvalue as any as CompletedQueueResult;
    const clientId = completedResult.userId;
    const response = {
      jobId: result.jobId,
      audioFileId: completedResult.audioFileId,
      status: completedResult.status,
      type: EventType.separate,
    };
    const sseResponse = sseConnections.get(clientId);
    if (sseResponse) sendEvent(sseResponse, response);
  });

  separateQueueEvents.on("failed", (reason, id) => {
    console.log("Separation failed - jobId:", reason.jobId);
    const failedResult = JSON.parse(reason.failedReason) as FailedQueueResult;
    console.log("Failed Result", JSON.parse(reason.failedReason));
    console.log("AudioFileId", failedResult["audioFileId"]);
    const response = {
      jobId: reason.jobId,
      audioFileId: failedResult.audioFileId,
      status: failedResult.status,
      error: failedResult.error,
      type: EventType.separate,
    };
    const sseResponse = sseConnections.get(failedResult.userId);
    if (sseResponse) sendEvent(sseResponse, response);
    else console.log("No sseResponse found for", failedResult.userId);
  });

  audioToMidiQueueEvents.on("completed", (result) => {
    console.log("Job completed - id", result.jobId);
    console.log("Job completed - result", result.returnvalue);
    const completedResult = result.returnvalue as any as CompletedQueueResult;
    const clientId = completedResult.userId;
    const response = {
      jobId: result.jobId,
      audioFileId: completedResult.audioFileId,
      status: completedResult.status,
      type: EventType.audioToMidi,
    };
    const sseResponse = sseConnections.get(clientId);
    if (sseResponse) sendEvent(sseResponse, response);
  });

  audioToMidiQueueEvents.on("failed", (reason, id) => {
    console.log("AudioToMidi failed - jobId:", reason.jobId);
    const failedResult = JSON.parse(reason.failedReason) as FailedQueueResult;
    console.log("Failed Result", JSON.parse(reason.failedReason));
    console.log("AudioFileId", failedResult["audioFileId"]);
    const response = {
      jobId: reason.jobId,
      audioFileId: failedResult.audioFileId,
      status: failedResult.status,
      error: failedResult.error,
      type: EventType.audioToMidi,
    };
    const sseResponse = sseConnections.get(failedResult.userId);
    if (sseResponse) sendEvent(sseResponse, response);
    else console.log("No sseResponse found for", failedResult.userId);
  });

  transcribeQueueEvents.on("completed", (result) => {
    console.log("Job completed - id", result.jobId);
    console.log("Job completed - result", result.returnvalue);
    const completedResult = result.returnvalue as any as CompletedQueueResult;
    const clientId = completedResult.userId;
    const response = {
      jobId: result.jobId,
      audioFileId: completedResult.audioFileId,
      status: completedResult.status,
      type: EventType.transcribe,
    };
    const sseResponse = sseConnections.get(clientId);
    if (sseResponse) sendEvent(sseResponse, response);
  });

  transcribeQueueEvents.on("failed", (reason, id) => {
    console.log("Transcription failed - jobId:", reason.jobId);
    const failedResult = reason.failedReason as any as FailedQueueResult;
    console.log("Failed Result", failedResult);
    console.log("AudioFileId", failedResult.audioFileId);
    const response = {
      jobId: reason.jobId,
      audioFileId: failedResult.audioFileId,
      status: failedResult.status,
      error: failedResult.error,
      type: EventType.transcribe,
    };
    const sseResponse = sseConnections.get(failedResult.userId);
    if (sseResponse) sendEvent(sseResponse, response);
    else console.log("No sseResponse found for", failedResult.userId);
  });

  app.get("/events", (req: Request, res: Response) => {
    // Initialie SSE connection with `clientId`
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).send("Unauthorized");

    console.log("Client connected", clientId);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "access-control-allow-origin": "*",
    });

    // Store the response object so we can send data to it later
    sseConnections.set(clientId, res);

    // Send a comment to the client, so it knows the connection was established
    res.write(":ok\n\n");

    // When the client closes the connection, remove the corresponding response object
    req.on("close", () => {
      console.log("Client closed connection", clientId);
      sseConnections.delete(clientId);
    });
  });

  app.post("/send", (req: Request, res: Response) => {
    const { message } = req.body;
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).send("Unauthorized");
    console.log("Sending message to client", message);
    const response = {
      type: EventType.message,
      status: "done" as QueueJobStatus,
      message: message as string,
    };
    const sseResponse = sseConnections.get(clientId);
    if (sseResponse) sendEvent(sseResponse, response);
    res.status(204).end();
  });

  app.post("/upload", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    if (!req.body) res.status(400).json({ message: "No data to upload" });

    const rawFile: RawFile = (await parseMultipartReq(req))[0];
    const extension = mime.extension(rawFile.info.mimeType);
    const objectKey = uuid();
    const fileName = `${user.id}/${objectKey}.${extension}`;
    const bucketName = process.env.MINIO_DEFAULT_BUCKET || "audio";

    // Upload the file to minio
    const response = await minioClient.putObject(
      bucketName,
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

    const waveform = await generateWaveFormJson(rawFile, objectKey, fileType);

    // Save the file to the database
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
        waveform: waveform,
      },
    });
    res.status(200).json({ id: audio.id });
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
        stems: {
          include: {
            midiFile: true,
            transcription: true,
          },
        },
        midiFile: true,
      },
    });
    res.status(200).send(files);
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

  /**
   * This endpoint accepts an audioFileId and returns the added job Id
   */
  app.post("/separate", async (req: Request, res: Response) => {
    const jobPayload = {
      userId: req.user?.id,
      audioFileId: req.body.data,
    };
    console.log("separate jobPayload", jobPayload);
    const job = await separateQueue.add("processData", jobPayload);
    res
      .status(200)
      .json({ message: "Data added to separate-queue", jobId: job.id });
  });

  app.post("/audio-to-midi", async (req: Request, res: Response) => {
    const jobPayload = {
      userId: req.user?.id,
      audioFileId: req.body.data,
    };
    console.log("audio-to-midi jobPayload", jobPayload);
    const job = await audioToMidiQueue.add("processData", jobPayload);
    res
      .status(200)
      .json({ message: "Data added to audioToMidi-queue", jobId: job.id });
  });

  app.post("/transcribe", async (req: Request, res: Response) => {
    const jobPayload = {
      userId: req.user?.id,
      audioFileId: req.body.data,
    };
    console.log("transcribe jobPayload", jobPayload);
    const job = await transcribeQueue.add("processData", jobPayload);
    res
      .status(200)
      .json({ message: "Data added to transcribe-queue", jobId: job.id });
  });

  app.get("/", async (req, res) => {
    res.status(200).json({ message: "Hello world" });
  });

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};

startUp();
