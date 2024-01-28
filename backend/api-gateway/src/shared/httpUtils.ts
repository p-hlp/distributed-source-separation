import busboy, { FileInfo } from "busboy";
import { Request } from "express";

export type RawFile = {
  data: Buffer; // Node.js Buffer
  info: FileInfo;
};

// Parses a standard Node.js IncomingMessage request - https://nodejs.org/api/http.html#class-httpincomingmessage
export const parseMultipartReq = async (req: Request) => {
  delete req.headers.authorization;
  const bb = busboy({ headers: req.headers });

  // Pipe request stream into busboy
  req.pipe(bb);

  // Returns a Promise containing array of parsed files, ready for upload!
  return new Promise<RawFile[]>((resolve) => {
    const files: RawFile[] = [];

    // Loops through all files in the form
    bb.on("file", (name, stream, info) => {
      const fileChunks: Buffer[] = [];
      stream.on("data", (chunk) => fileChunks.push(chunk));
      stream.on("end", () =>
        files.push({ data: Buffer.concat(fileChunks), info })
      );
    });

    bb.on("close", () => resolve(files));
  });
};

const contentTypeToFileType: Record<string, string> = {
  "audio/wav": "wav",
  "audio/flac": "flac",
  "audio/mp3": "mp3",
  "audio/mpeg": "mp3",
  "audio/x-wav": "wav",
  "audio/x-flac": "flac",
  "audio/x-mp3": "mp3",
  "audio/x-ogg": "ogg",
  "audio/x-mpeg": "mp3",
};

export const getFileType = (contentType: string): string | undefined => {
  return contentTypeToFileType[contentType];
};
