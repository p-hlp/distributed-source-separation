import ffmpeg from "fluent-ffmpeg";
import os from "os";
import path from "path";
import { PassThrough, Readable } from "stream";
import { v4 as uuid } from "uuid";
import { minioClient, prisma } from "../../lib";
import { generateWaveFormAndDurationFromFilePath } from "../../shared";
import { ENV } from "../../types";

/**
 * Segment and save an audio file stream to minio
 * @param inputStream - Readable stream of the audio file
 * @param objectName - Name of the object to be saved in minio
 * @param fileType - Type of the audio file
 * @param start - Start time of the segment
 * @param duration - Duration of the segment
 * @returns - Name of the object saved in minio
 */
export const segmentAndSave = async (
  inputStream: Readable,
  objectName: string,
  fileType: string,
  start: number,
  duration: number
) => {
  try {
    const outStream = new PassThrough();
    ffmpeg(inputStream)
      .inputFormat(fileType)
      .format(fileType)
      .seekInput(start)
      .duration(duration)
      .output(outStream, { end: true })
      .on("progress", (p) => console.log(p))
      .on("error", (err) => console.error(err))
      .on("end", () => console.log("finished processing"))
      .run();

    await minioClient.putObject(
      ENV.MINIO_DEFAULT_BUCKET,
      objectName,
      outStream
    );
    return objectName;
  } catch (err) {
    throw new Error("Error uploading file to minio.");
  }
};

/**
 * Segment and save an audio file stream to minio and database (local processing)
 * @param inputStream - Readable stream of the audio file
 * @param userId - Id of the user
 * @param libraryId - Id of the library
 * @param parentId - Id of the parent audio file
 * @param fileName - Name of the file (how it will be in db)
 * @param fileType - Type of the audio file
 * @param start
 * @param duration
 * @param parentId
 * @returns
 */
export const segmentAndSaveLocal = async (
  inputStream: Readable,
  userId: string,
  libraryId: string,
  parentId: string,
  fileName: string,
  fileType: string,
  start: number,
  duration: number,
  isVocal = false
) => {
  const tmpFolder = os.tmpdir();
  const objectName = `${userId}/${uuid()}.${fileType}`;
  const tmpPath = path.join(tmpFolder, objectName); // /tmp/userId/uuid.fileType

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputStream)
      .inputFormat(fileType)
      .format(fileType)
      .seekInput(start)
      .duration(duration)
      .on("error", (err) => {
        console.error(err);
        reject(err);
      })
      .on("end", () => {
        console.log("finished processing");
        resolve();
      })
      .save(tmpPath);
  });

  // Upload the file to minio
  await minioClient.fPutObject(ENV.MINIO_DEFAULT_BUCKET, objectName, tmpPath);
  console.log("File uploaded to minio.");

  // Generate waveform and duration
  console.log("Generating waveform and duration from file path.", tmpPath);
  const { waveform, durationInSeconds } =
    await generateWaveFormAndDurationFromFilePath(tmpPath);

  // Save to database
  const audio = await prisma.audioFile.create({
    data: {
      user: { connect: { id: userId } },
      library: { connect: { id: libraryId } },
      parent: { connect: { id: parentId } },
      name: fileName,
      filePath: objectName,
      fileType: fileType,
      duration: durationInSeconds,
      waveform: waveform,
      isVocal: isVocal,
    },
  });

  return audio.id;
};
