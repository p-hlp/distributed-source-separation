import { QueueJobStatus } from "./queue";

export enum EventType {
  separate = "separate",
  midi = "midi",
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
