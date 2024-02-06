import { useContext, useEffect } from "react";
import { SSEContext, SSEContextValue } from "../contexts/SSEContext";

/**
 * Opens an EventSource connection to the API Gateway on the given endpoint.
 * @param endpoint Should be a string that starts with a forward slash, e.g. "/queue"
 */
export const useSSE = (endpoint: string) => {
  // TODO Invalidate queries to refetch when certain events happen
  // https://tkdodo.eu/blog/using-web-sockets-with-react-query#react-query-integration
  //   const queryClient = useQueryClient();
  useEffect(() => {
    const eventSource = new EventSource(
      import.meta.env.VITE_API_GATEWAY_URL + endpoint
    );

    eventSource.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(event.data);
      //   const queryKey = [...data.entity, data.id].filter(Boolean)
      //   queryClient.invalidateQueries({ queryKey });
      console.log(data);
    };
    return () => {
      // cleanup event source
      eventSource.close();
    };
  }, [endpoint]);

  return null;
};

// Hook for consuming the context
export const useSSEContext = (): SSEContextValue => {
  const context = useContext(SSEContext);
  if (context === undefined) {
    throw new Error("useSSEContext must be used within an SSEProvider");
  }
  return context;
};
