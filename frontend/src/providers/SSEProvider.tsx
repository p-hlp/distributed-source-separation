// SSEContext.tsx

import { ReactNode, useEffect, useState } from "react";
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
  const { accessToken } = useAccessToken();
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    if (!accessToken || eventSource) return; // Avoid creating multiple connections

    const endpoint = buildUrl("/events", accessToken);
    console.log("Creating shared SSE connection to", endpoint);

    const es = new EventSource(endpoint);
    setEventSource(es);

    return () => {
      es.close();
      console.log("Shared SSE connection closed");
    };
  }, [accessToken, eventSource]);

  return (
    <SSEContext.Provider value={{ eventSource }}>
      {children}
    </SSEContext.Provider>
  );
};
