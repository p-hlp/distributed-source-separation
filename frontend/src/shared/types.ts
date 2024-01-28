import { z } from "zod";

const StemSchema = z.object({
  id: z.string(),
  name: z.string(),
  filePath: z.string(),
  userId: z.string(),
  fileType: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AudioFileSchema = StemSchema.extend({
  stems: z.array(StemSchema).optional(),
});

export type StemResponse = z.infer<typeof StemSchema>;

export type AudioFileResponse = z.infer<typeof AudioFileSchema>;
