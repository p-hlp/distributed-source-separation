import { Client, ClientOptions } from "minio";

const clientOption: ClientOptions = {
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: parseInt(process.env.MINIO_PORT ?? "9000"),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY ?? "",
  secretKey: process.env.MINIO_SECRET_KEY ?? "",
};

export const minioClient = new Client(clientOption);

export const initMinioDefaultBucket = async () => {
  const bucketExists = await minioClient.bucketExists(
    process.env.MINIO_DEFAULT_BUCKET ?? ""
  );
  if (bucketExists) {
    const msg = `Default bucket "${process.env.MINIO_DEFAULT_BUCKET}" already exists.`;
    console.log(msg);
    return;
  }
  await minioClient.makeBucket(
    process.env.MINIO_DEFAULT_BUCKET ?? "",
    "eu-central-1" // Europe(Frankfurt)
  );
};
