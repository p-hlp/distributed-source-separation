import express, { Request, Response } from "express";
import mime from "mime-types";
import { v4 as uuid } from "uuid";
import { minioClient, prisma } from "../../lib";
import {
  RawFile,
  generateWaveFormJson,
  getFileType,
  parseMultipartReq,
} from "../../shared";
import { removeFileExtension } from "../../shared/stringUtils";
import { ENV } from "../../types";

export const librariesRouter = express.Router();

librariesRouter.get("/", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const libraries = await prisma.library.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  res.status(200).send(libraries);
});

librariesRouter.get("/:id", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const id = req.params.id;

  const library = await prisma.library.findUnique({
    where: {
      id: id,
      userId: user.id,
    },
    include: {
      audioFiles: true,
    },
  });
  if (!library) return res.status(404).send("Library not found");
  res.status(200).json(library);
});

librariesRouter.post("/", async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Unauthorized");
  const { name, description } = req.body;
  console.log("Creating library for user", user);

  const library = await prisma.library.create({
    data: {
      name,
      description,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  res.status(200).send(library);
});

librariesRouter.put("/:id", async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Unauthorized");

  const id = req.params.id;
  const { name, description } = req.body;
  const library = await prisma.library.update({
    where: {
      id: id,
      userId: user.id,
    },
    data: {
      name,
      description,
    },
  });
  res.status(200).send(library);
});

librariesRouter.delete("/:id", async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).send("Unauthorized");

  const id = req.params.id;
  const library = await prisma.library.delete({
    where: {
      id: id,
    },
  });
  res.status(200).send(library);
});

librariesRouter.post("/:id/files", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  if (!req.body) res.status(400).json({ message: "No data to upload" });
  const user = req.user;
  const libraryId = req.params.id;

  const rawFile: RawFile = (await parseMultipartReq(req))[0];
  const extension = mime.extension(rawFile.info.mimeType);
  const objectKey = uuid();
  const fileName = `${user.id}/${objectKey}.${extension}`;
  const bucketName = ENV.MINIO_DEFAULT_BUCKET;

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
  const fileNameWithoutEnding = removeFileExtension(rawFile.info.filename);
  const audio = await prisma.audioFile.create({
    data: {
      name: fileNameWithoutEnding,
      filePath: fileName,
      fileType: fileType,
      user: {
        connect: {
          id: user.id,
        },
      },
      library: {
        connect: {
          id: libraryId,
        },
      },
      waveform: waveform,
    },
  });
  res.status(200).json({ id: audio.id });
});

librariesRouter.get("/:id/files", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const id = req.params.id;

  console.log("Fetching files for library", id, "for user", user.id);

  const files = await prisma.audioFile.findMany({
    where: {
      libraryId: id,
      userId: user.id,
      parentId: null,
    },
    include: {
      midiFile: true,
      transcription: true,
      slices: true,
      stems: {
        include: {
          slices: true,
          midiFile: true,
          transcription: true,
        },
      },
    },
  });
  res.status(200).send(files);
});

librariesRouter.get(
  "/:id/files/:fileId",
  async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = req.user;
    const id = req.params.id;
    const fileId = req.params.fileId;

    const file = await prisma.audioFile.findUnique({
      where: {
        id: fileId,
        libraryId: id,
        userId: user.id,
      },
      include: {
        midiFile: true,
        transcription: true,
        slices: true,
        stems: {
          include: {
            slices: true,
            midiFile: true,
            transcription: true,
          },
        },
      },
    });
    if (!file) return res.status(404).send("File not found");
    res.status(200).send(file);
  }
);

librariesRouter.get(
  "/:id/files/:fileId/children",
  async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = req.user;
    const id = req.params.id;
    const fileId = req.params.fileId;

    const files = await prisma.audioFile.findMany({
      where: {
        libraryId: id,
        userId: user.id,
        parentId: fileId,
      },
      include: {
        midiFile: true,
        transcription: true,
        slices: true,
      },
    });
    res.status(200).send(files);
  }
);

librariesRouter.post(
  "/:id/files/:fileId/children",
  async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (!req.body) res.status(400).json({ message: "No data to upload" });
    const user = req.user;
    const libraryId = req.params.id;
    const parentId = req.params.fileId;

    const rawFile: RawFile = (await parseMultipartReq(req))[0];
    const extension = mime.extension(rawFile.info.mimeType);
    const objectKey = uuid();
    const fileName = `${user.id}/${objectKey}.${extension}`;
    const bucketName = ENV.MINIO_DEFAULT_BUCKET;

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
    const fileNameWithoutEnding = removeFileExtension(rawFile.info.filename);
    const audio = await prisma.audioFile.create({
      data: {
        name: fileNameWithoutEnding,
        filePath: fileName,
        fileType: fileType,
        user: {
          connect: {
            id: user.id,
          },
        },
        parent: {
          connect: {
            id: parentId,
          },
        },
        library: {
          connect: {
            id: libraryId,
          },
        },
        waveform: waveform,
      },
    });
    res.status(200).json({ id: audio.id });
  }
);
