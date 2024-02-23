import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),

  AUTH0_DOMAIN: z.string(),
  AUTH0_ISSUER_BASE_URL: z.string(),
  AUTH0_API_AUDIENCE: z.string(),
  AUTH0_API_GATEWAY_CLIENT_ID: z.string(),
  AUTH0_API_GATEWAY_CLIENT_SECRET: z.string(),

  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.coerce.number(),
  MINIO_DEFAULT_BUCKET: z.string(),

  DATABASE_URL: z.string(),
});

const envTmp = envSchema.safeParse(process.env);

if (!envTmp.success) {
  console.error(envTmp.error.issues);
  throw new Error("There is an error with the server environment variables.");
}

export const ENV = envTmp.data;
