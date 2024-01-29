import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib";
import { useAccessToken } from "../lib/TokenContext";

interface Props {
  onMessage: (message: string) => void;
}

const buildUrl = (endpoint: string, token: string) => {
  const url = new URL(import.meta.env.VITE_API_GATEWAY_URL + endpoint);
  url.searchParams.append("token", token);
  return url.toString();
};

export const SSEComponent = ({ onMessage }: Props) => {
  const [message, setMessage] = useState<string>("");
  const { accessToken } = useAccessToken();

  const handleSendMessage = async () => {
    const response = axiosInstance.post("/send", { message });
    console.log(response);
  };

  useEffect(() => {
    console.log("Running SSEComponent useEffect");
    if (!accessToken) return;
    const endpoint = buildUrl("/events", accessToken);

    console.log("Creating SSE connection to", endpoint);

    const eventSource = new EventSource(endpoint);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
      console.log("onMessage event", data);
    };

    return () => {
      eventSource.close();
      console.log("SSE connection closed");
    };
  }, [accessToken, onMessage]);

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
