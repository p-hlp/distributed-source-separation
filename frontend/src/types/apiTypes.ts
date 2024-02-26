import { z } from "zod";

const LibrarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Library = z.infer<typeof LibrarySchema>;
export type LibraryResponse = Library[];

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
  length: z.number(), // length of the waveform data (number of minimum and maximum value pars per channel)
  sample_rate: z.number(), // sample rate of the orignal audio file
  samples_per_pixel: z.number(),
  channels: z.number(),
  version: z.number(),
  data: z.array(z.number()),
});

const RegionSchema = z.object({
  id: z.string(),
  sliceId: z.string(),
  name: z.string(),
  start: z.number(),
  end: z.number().nullable(),
  color: z.string(),
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
  slices: z.array(RegionSchema),
  isVocal: z.boolean(),
  isSeparated: z.boolean(),
  preSignedUrl: z.string(),
  duration: z.number(),
});

const AudioFileSchema = StemSchema.extend({
  stems: z.array(StemSchema).optional(),
});

const FileInfoSchema = z.object({
  name: z.string(),
  fileType: z.string(),
  durationInSeconds: z.number(),
  libraryName: z.string(),
  parentName: z.string().nullable(),
  slices: z.number(),
  hasMidi: z.boolean(),
  hasTranscription: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RegionResponse = z.infer<typeof RegionSchema>;

export type WaveformData = z.infer<typeof WavefromDataSchema>;

export type TranscriptionResponse = z.infer<typeof TranscriptionSchema>;

export type MidiFileResponse = z.infer<typeof MidiFileSchema>;

export type StemResponse = z.infer<typeof StemSchema>;

export type AudioFileResponse = z.infer<typeof AudioFileSchema>;

export type FileInfoResponse = z.infer<typeof FileInfoSchema>;
