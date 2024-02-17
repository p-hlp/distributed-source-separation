export type QueueJobStatus = "done" | "inProgress" | "failed";

export interface CompletedQueueResult {
  userId: string;
  audioFileId: string;
  status: QueueJobStatus;
  progress?: number;
}

export type FailedQueueResult = CompletedQueueResult & { error: string };
