import { User } from "@prisma/client";
import mime from "mime-types";
import { v4 as uuid } from "uuid";
import { minioClient, prisma } from "../../lib";
import {
  RawFile,
  generateWaveFormJsonAndDuration,
  getFileType,
} from "../../shared";
import { removeFileExtension } from "../../shared/stringUtils";
import { ENV } from "../../types";

export const saveFile = async (
  file: RawFile,
  user: User,
  libraryId: string
): Promise<string> => {
  const extension = mime.extension(file.info.mimeType);
  const objectKey = uuid();
  const fileName = `${user.id}/${objectKey}.${extension}`;

  // Upload the file to minio
  const response = await minioClient.putObject(
    ENV.MINIO_DEFAULT_BUCKET,
    fileName,
    file.data,
    undefined,
    file.info
  );

  if (response instanceof Error) {
    throw new Error("Error uploading file");
  }

  const fileType = getFileType(file.info.mimeType);
  if (!fileType) {
    throw new Error("Unsupported file type");
  }

  // Compute waveform and duration
  const { waveform, durationInSeconds } = await generateWaveFormJsonAndDuration(
    file,
    objectKey,
    fileType
  );

  const fileNameWithoutEnding = removeFileExtension(file.info.filename);

  const audio = await prisma.audioFile.create({
    data: {
      name: fileNameWithoutEnding,
      filePath: fileName,
      fileType: fileType,
      duration: durationInSeconds,
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

  return audio.id;
};
