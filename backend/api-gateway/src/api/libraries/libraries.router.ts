import archiver from "archiver";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { minioClient, prisma } from "../../lib";
import { RawFile, parseMultipartReq, removeDir } from "../../shared";
import { ENV } from "../../types";
import { saveFile } from "./fileUpload";
import { segmentAndSaveLocal } from "./utils";

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
  const option = req.params.option;

  const library = await prisma.library.findUnique({
    where: {
      id: id,
      userId: user.id,
    },
    include: {
      audioFiles: option === "dense" ? false : true,
    },
  });
  if (!library) return res.status(404).send("Library not found");
  res.status(200).json(library);
});

librariesRouter.get("/:id/dense", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const id = req.params.id;

  const library = await prisma.library.findUnique({
    where: {
      id: id,
      userId: user.id,
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

  const rawFiles: RawFile[] = await parseMultipartReq(req);
  const audioIds = [];
  for (const rawFile of rawFiles) {
    const audioId = await saveFile(rawFile, user, libraryId);
    audioIds.push(audioId);
  }
  res.status(200).json(audioIds);
});

librariesRouter.get("/:id/files", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const id = req.params.id;

  const files = await prisma.audioFile.findMany({
    where: {
      libraryId: id,
      userId: user.id,
      parentId: null,
    },
    include: {
      midiFile: true,
      transcription: true,
      stems: {
        include: {
          midiFile: true,
          transcription: true,
        },
      },
    },
  });

  const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
  res.status(200).send(sortedFiles);
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
        // stems: {
        //   include: {
        //     midiFile: true,
        //     transcription: true,
        //   },
        // },
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
    const fileId = req.params.fileId;

    const rawFiles: RawFile[] = await parseMultipartReq(req);
    const audioIds = [];
    for (const rawFile of rawFiles) {
      const audioId = await saveFile(rawFile, user, libraryId, fileId);
      audioIds.push(audioId);
    }
    res.status(200).json(audioIds);
  }
);

interface PostRegionsData {
  parentId: string;
  regions: Region[];
}

interface Region {
  name: string;
  start: number;
  end: number;
}

librariesRouter.post(
  "/:id/files/:fileId/regions",
  async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = req.user;
    const fileId = req.params.fileId;
    const { parentId, regions } = req.body as PostRegionsData;
    const libraryId = req.params.id;

    // Get file from database and minio
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: fileId },
      select: { id: true, filePath: true, fileType: true, isVocal: true },
    });

    if (!audioFile) res.status(404).send("File not found");

    const isVocal = Boolean(audioFile?.isVocal);

    console.log("Fetched audio file from database: ", audioFile?.id);
    const filePath = audioFile?.filePath as string;
    const fileType = audioFile?.fileType as string;

    console.log("Fetched audio file from minio: ", filePath);

    // TODO only for debugging
    await removeDir(path.join(os.tmpdir(), user.id));
    await fs.mkdir(path.join(os.tmpdir(), user.id));

    const savedIds: string[] = [];
    for (const region of regions) {
      // INFO if stream is only gotten once, the second iteration will not work
      const stream = await minioClient.getObject(
        ENV.MINIO_DEFAULT_BUCKET,
        filePath
      );
      console.log("Processing region: ", region.name);
      const savedRegionId = await segmentAndSaveLocal(
        stream,
        user.id,
        libraryId,
        parentId,
        region.name,
        fileType,
        region.start,
        region.end - region.start,
        isVocal
      );
      savedIds.push(savedRegionId);
    }

    await removeDir(path.join(os.tmpdir(), user.id));
    res.status(200).json(savedIds);
  }
);

// // Provides a zip file with all the files in the library
librariesRouter.get("/:id/export", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  const user = req.user;
  const libraryId = req.params.id;

  const library = await prisma.library.findUnique({
    where: {
      id: libraryId,
    },
  });

  if (!library) return res.status(404).send("Library not found");

  const libraryName = library.name;

  // Get every file that has library and no parent -> root files
  const libraryFiles = await prisma.audioFile.findMany({
    where: {
      libraryId: libraryId,
      userId: user.id,
      parentId: null,
    },
    include: {
      stems: true,
    },
  });

  if (!libraryFiles.length)
    return res.status(404).send(`No files in library: ${libraryId}.`);

  // Setup archiver
  const archive = archiver("zip", { zlib: { level: 9 } });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${libraryName}.zip`
  );
  archive.pipe(res);

  // Add every root file to the zip and add a folder with root file name
  for (const file of libraryFiles) {
    const fileStream = await minioClient.getObject(
      ENV.MINIO_DEFAULT_BUCKET,
      file.filePath
    );
    archive.append(fileStream, { name: `${file.name}.${file.fileType}` });
    console.log("Appending file to zip: ", file.name);

    for (const child of file.stems) {
      const childStream = await minioClient.getObject(
        ENV.MINIO_DEFAULT_BUCKET,
        child.filePath
      );
      console.log("Appending child to zip: ", child.name);
      archive.append(childStream, {
        name: `${file.name}/${child.name}.${child.fileType}`,
      });
    }
  }

  archive.finalize();
});

librariesRouter.get(
  "/:libraryId/files/:fileId/export",
  async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = req.user;
    const libraryId = req.params.libraryId;
    const fileId = req.params.fileId;

    const file = await prisma.audioFile.findUnique({
      where: {
        id: fileId,
        libraryId: libraryId,
        userId: user.id,
      },
      include: {
        stems: true,
      },
    });

    if (!file) return res.status(404).send("File not found");
    if (!file.stems.length)
      return res.status(404).send("No associated files found.");

    const archive = archiver("zip", { zlib: { level: 9 } });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.name}.zip`
    );
    archive.pipe(res);

    for (const stem of file.stems) {
      const stream = await minioClient.getObject(
        ENV.MINIO_DEFAULT_BUCKET,
        stem.filePath
      );
      archive.append(stream, {
        name: `${file.name}/${stem.name}.${stem.fileType}`,
      });
    }

    archive.finalize();
  }
);
