export type EventType = "separate" | "message" | "transcribe" | "midi";
export type EventStatus = "done" | "inProgress" | "failed";

export interface EventData {
  type: EventType;
  status: EventStatus;
  jobId?: string;
  audioFileId?: string;
  error?: string;
  message?: string;
}

export interface EventHandlerRegistration {
  type?: EventType;
  status?: EventStatus;
  callback: (eventData: EventData) => void;
}
