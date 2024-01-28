import { Queue, QueueEvents } from "bullmq";
import { processQueueName } from "../types";

export const processQueue = new Queue(processQueueName);
export const processQueueEvents = new QueueEvents(processQueueName);