import { Client, ClientOptions } from "minio";
import { ENV } from "../types";

const clientOption: ClientOptions = {
  endPoint: ENV.MINIO_ENDPOINT,
  port: ENV.MINIO_PORT,
  useSSL: false,
  accessKey: ENV.MINIO_ACCESS_KEY,
  secretKey: ENV.MINIO_SECRET_KEY,
};

export const minioClient = new Client(clientOption);

export const initMinioDefaultBucket = async () => {
  const bucketExists = await minioClient.bucketExists(ENV.MINIO_DEFAULT_BUCKET);
  if (bucketExists) {
    const msg = `Default bucket "${ENV.MINIO_DEFAULT_BUCKET}" already exists.`;
    console.log(msg);
    return;
  }
  await minioClient.makeBucket(
    ENV.MINIO_DEFAULT_BUCKET,
    "eu-central-1" // Europe(Frankfurt)
  );
};
