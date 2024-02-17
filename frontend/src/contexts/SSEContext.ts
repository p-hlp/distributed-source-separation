import { createContext, useContext } from "react";

export type MessageEventListener = (event: MessageEvent<unknown>) => void;

interface ISSEContext {
  eventSource: EventSource | null;
  addEventListener: (type: string, listener: MessageEventListener) => void;
  removeEventListener: (type: string, listener: MessageEventListener) => void;
}

export const SSEContext = createContext<ISSEContext | undefined>(undefined);

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (context === undefined) {
    throw new Error("useSSE must be used within a SSEProvider");
  }
  return context;
};
