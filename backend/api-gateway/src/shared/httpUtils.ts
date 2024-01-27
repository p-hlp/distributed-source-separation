import busboy, { FileInfo } from "busboy";
import { Request } from "express";

export type RawFile = {
  data: Buffer; // Node.js Buffer
  info: FileInfo;
};

// Parses a standard Node.js IncomingMessage request - https://nodejs.org/api/http.html#class-httpincomingmessage
export const parseMultipartReq = async (req: Request) => {
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
