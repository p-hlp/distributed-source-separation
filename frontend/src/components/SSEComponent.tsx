import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { MessageEventListener, useSSE } from "../contexts/SSEContext";
import { axiosInstance } from "../lib";

export const SSEComponent = () => {
  const [message, setMessage] = useState<string>("");
  const { addEventListener, removeEventListener } = useSSE();

  const handleSendMessage = async () => {
    const response = axiosInstance.post("/send", { message });
    console.log(response);
  };

  useEffect(() => {
    const messageHandler: MessageEventListener = (
      event: MessageEvent<unknown>
    ) => {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        console.log("message event", data);
      }
    };

    addEventListener("message", messageHandler);

    return () => {
      removeEventListener("message", messageHandler);
    };
  }, [addEventListener, removeEventListener]);

  return (
    <Stack direction="column" spacing={1}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Event Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="outlined" onClick={handleSendMessage}>
          Send Event
        </Button>
      </Stack>
    </Stack>
  );
};
