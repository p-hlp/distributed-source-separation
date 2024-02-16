import { z } from "zod";

const MidiFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  filePath: z.string(),
  userId: z.string(),
  fileType: z.string(),
  audioFileId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TranscriptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  userId: z.string(),
  audioFileId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const WavefromDataSchema = z.object({
  bits: z.number(),
  length: z.number(),
  sample_rate: z.number(),
  samples_per_pixel: z.number(),
  channels: z.number(),
  version: z.number(),
  data: z.array(z.number()),
});

const StemSchema = z.object({
  id: z.string(),
  name: z.string(),
  filePath: z.string(),
  userId: z.string(),
  fileType: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  midiFile: MidiFileSchema.optional(),
  transcription: TranscriptionSchema.optional(),
  waveform: WavefromDataSchema,
});

const AudioFileSchema = StemSchema.extend({
  stems: z.array(StemSchema).optional(),
});

export type WaveformData = z.infer<typeof WavefromDataSchema>;

export type TranscriptionResponse = z.infer<typeof TranscriptionSchema>;

export type MidiFileResponse = z.infer<typeof MidiFileSchema>;

export type StemResponse = z.infer<typeof StemSchema>;

export type AudioFileResponse = z.infer<typeof AudioFileSchema>;
