import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { registerApiRoutes } from "./api";
import {
  audioToMidiQueue,
  audioToMidiQueueEvents,
  initMinioDefaultBucket,
  minioClient,
  prisma,
  sendEvent,
  separateQueue,
  separateQueueEvents,
  sseConnections,
  transcribeQueue,
  transcribeQueueEvents,
} from "./lib";
import {
  authenticate,
  createOrAddUser,
  tokenParamToHeader,
} from "./middleware";
import {
  CompletedQueueResult,
  ENV,
  EventType,
  FailedQueueResult,
} from "./types";
import { FileInfoResponse } from "./types/api";

const startUp = async () => {
  const app: Express = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(tokenParamToHeader);
  app.use(authenticate);
  app.use(createOrAddUser);

  await initMinioDefaultBucket();

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
      type: EventType.midi,
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
      type: EventType.midi,
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
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).send("Unauthorized");

    console.log("Client connected", clientId);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "access-control-allow-origin": "*",
    });

    sseConnections.set(clientId, res);

    res.write(":ok\n\n");

    req.on("close", () => {
      console.log("Client closed connection", clientId);
      sseConnections.delete(clientId);
    });
  });

  app.get("/files/:id", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;
    const audioFile = await prisma.audioFile.findUnique({
      where: {
        id: id,
      },
      include: {
        stems: {
          include: {
            midiFile: true,
            transcription: true,
          },
        },
        midiFile: true,
        transcription: true,
      },
    });
    if (!audioFile) return res.status(404).send("Audio file not found");
    const url = await preSignUrl(audioFile.filePath);
    const file = { ...audioFile, preSignedUrl: url };
    res.status(200).send(file);
  });

  app.delete("/files/:id", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;
    const file = await prisma.audioFile.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json(file.id);
  });

  app.get("/files/:id/transcription", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;

    const transcription = await prisma.transcription.findFirst({
      where: {
        audioFileId: id,
      },
    });
    res.status(200).send(transcription);
  });

  app.get("/files/:id/midi", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;

    const midiFile = await prisma.midiFile.findFirst({
      where: {
        audioFileId: id,
      },
    });

    res.status(200).send(midiFile);
  });

  app.get("/files/:id/info", async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send("Unauthorized");
    const id = req.params.id;

    const audioFile = await prisma.audioFile.findUnique({
      where: {
        id: id,
      },
      include: {
        stems: true,
        midiFile: true,
        transcription: true,
        library: true,
        parent: true,
      },
    });
    if (!audioFile) return res.status(404).send("Audio file not found");

    const response: FileInfoResponse = {
      name: audioFile.name,
      fileType: audioFile.fileType,
      durationInSeconds: audioFile.duration,
      libraryName: audioFile.library?.name || "Unknown",
      parentName: audioFile.parent?.name || "Unknown",
      hasMidi: Boolean(audioFile.midiFile),
      hasTranscription: Boolean(audioFile.transcription),
      isVocal: Boolean(audioFile.isVocal),
      createdAt: audioFile.createdAt.toISOString(),
      updatedAt: audioFile.updatedAt.toISOString(),
    };
    res.status(200).json(response);
  });

  const preSignUrl = async (
    filePath: string,
    expiry = 60 * 60 * 24
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      minioClient.presignedUrl(
        "GET",
        ENV.MINIO_DEFAULT_BUCKET,
        filePath,
        expiry,
        (err, url) => {
          if (err) reject(err);
          resolve(url);
        }
      );
    });
  };

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
      ENV.MINIO_DEFAULT_BUCKET,
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
      audioFileId: req.body.audioFileId,
      libraryId: req.body.libraryId,
    };
    console.log("separate jobPayload", jobPayload);
    const job = await separateQueue.add("processData", jobPayload);
    res
      .status(200)
      .json({ message: "Data added to separate-queue", jobId: job.id });
  });

  app.post("/midi", async (req: Request, res: Response) => {
    const jobPayload = {
      userId: req.user?.id,
      audioFileId: req.body.audioFileId,
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
      audioFileId: req.body.audioFileId,
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

  registerApiRoutes(app);

  app.listen(ENV.PORT, () => {
    console.log(
      `⚡️[server]: Server is running at http://localhost:${ENV.PORT}`
    );
  });
};

startUp();
