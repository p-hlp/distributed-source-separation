import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { SSEContext } from "../contexts/SSEContext";
import { useAccessToken } from "../contexts/TokenContext";

interface SSEProviderProps {
  children: ReactNode;
}

const buildUrl = (endpoint: string, token: string): string => {
  const url = new URL(import.meta.env.VITE_API_GATEWAY_URL + endpoint);
  url.searchParams.append("token", token);
  return url.toString();
};

export const SSEProvider = ({ children }: SSEProviderProps) => {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const eventSourceInitialized = useRef(false);
  const { accessToken } = useAccessToken();

  useEffect(() => {
    if (!accessToken || eventSourceInitialized.current) return;

    const endpoint = buildUrl("/events", accessToken);
    const es = new EventSource(endpoint);
    const messageHandler = (event: MessageEvent<unknown>) => {
      console.log(event);
    };
    es.addEventListener("message", messageHandler);

    console.log("EventSource connected.");
    setEventSource(es);
    eventSourceInitialized.current = true;

    return () => {
      console.log("EventSource disconnected.");
      es.close();
      setEventSource(null);
      eventSourceInitialized.current = false;
    };
  }, [accessToken]); // Depend only on accessToken

  const addEventListener = useCallback(
    (type: string, listener: (event: MessageEvent<unknown>) => void) => {
      eventSource?.addEventListener(type, listener);
    },
    [eventSource]
  );

  const removeEventListener = useCallback(
    (type: string, listener: (event: MessageEvent<unknown>) => void) => {
      eventSource?.removeEventListener(type, listener);
    },
    [eventSource]
  );

  return (
    <SSEContext.Provider
      value={{ eventSource, addEventListener, removeEventListener }}
    >
      {children}
    </SSEContext.Provider>
  );
};
