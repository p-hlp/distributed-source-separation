import { useEffect } from "react";
import { useSSE } from "../contexts/SSEContext";
import { EventData, EventHandlerRegistration } from "../shared/handlerTypes";

export const useRegisterSSEListener = (
  handlerReg: EventHandlerRegistration[]
) => {
  const { addEventListener, removeEventListener } = useSSE();

  useEffect(() => {
    const eventListener = (event: MessageEvent<any>) => {
      if (typeof event.data === "string") {
        let eventData: EventData;
        try {
          eventData = JSON.parse(event.data);
        } catch (error) {
          console.error("Error parsing event data", error);
          return;
        }

        handlerReg.forEach(({ type, status, callback }) => {
          if (
            (!type || eventData.type === type) &&
            (!status || eventData.status === status)
          ) {
            callback(eventData);
          }
        });
      }
    };

    addEventListener("message", eventListener);

    return () => {
      removeEventListener("message", eventListener);
    };
  }, [addEventListener, handlerReg, removeEventListener]);
};
