import { createContext } from "react";

export interface SSEContextValue {
  eventSource: EventSource | null;
}

export const SSEContext = createContext<SSEContextValue | undefined>(undefined);
