import express, { Request, Response } from "express";
import { prisma } from "../../lib";
import { RawFile, parseMultipartReq } from "../../shared";
import { saveFile } from "./fileUpload";

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
        stems: {
          include: {
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
