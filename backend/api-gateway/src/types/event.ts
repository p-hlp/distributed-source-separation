import { QueueJobStatus } from "./queue";

export enum EventType {
  separate = "separate",
  audioToMidi = "audioToMidi",
  transcribe = "transcribe",
  message = "message",
}

export interface EventResponse {
  type: EventType;
  status: QueueJobStatus;
  jobId?: string;
  audioFileId?: string;
  error?: string;
  message?: string;
}
