import { Queue, QueueEvents } from "bullmq";
import { audioToMidiQueueName, separateQueueName } from "../types";

export const separateQueue = new Queue(separateQueueName);
export const separateQueueEvents = new QueueEvents(separateQueueName);

export const audioToMidiQueue = new Queue(audioToMidiQueueName);
export const audioToMidiQueueEvents = new QueueEvents(audioToMidiQueueName);
