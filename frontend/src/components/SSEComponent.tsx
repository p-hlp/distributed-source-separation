import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAccessToken } from "../contexts/TokenContext";
import { axiosInstance } from "../lib";

interface Props {
  onMessage: (message: string, toggleSeparationProgres: boolean) => void;
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
      const eventName = data.event;
      switch (eventName) {
        case "message":
          onMessage(data.message, false);
          console.log("message event", data);
          break;
        case "separate":
          onMessage(`${eventName}: ${data.status}`, true);
          console.log("separate event", data);
          break;
        case "audioToMidi":
          onMessage(`${eventName}: ${data.status}`, false);
          console.log("audioToMidi event", data);
          break;
        case "transcribe":
          onMessage(`${eventName}: ${data.status}`, false);
          console.log("transcribe event", data);
          break;
        default:
          console.log("Unhandled event", eventName);
      }
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
