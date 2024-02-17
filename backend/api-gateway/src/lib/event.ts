import { Response } from "express";
import { EventResponse } from "../types/event";

export const sseConnections = new Map<string, Response>();

export const sendEvent = (res: Response, data: EventResponse) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};
