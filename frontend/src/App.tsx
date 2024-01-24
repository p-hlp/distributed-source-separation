import { useAuth0 } from "@auth0/auth0-react";
import { Button, ButtonGroup, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { LogoutButton } from "./components/LogoutButton";
import { axiosInstance } from "./lib/axios";

export const App = () => {
  const { isAuthenticated } = useAuth0();
  const [text, setText] = useState("");

  const handleTestQueueRequest = async () => {
    const response = await axiosInstance.post("/queue", {
      data: text,
    });
    console.log(response.data);
  };

  return (
    <Stack direction="row" spacing={2} padding={2}>
      <TextField
        id="text-input"
        label="Queue Message"
        value={text}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setText(event.target.value);
        }}
      />
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={handleTestQueueRequest}>Test Queue</Button>
        {isAuthenticated && <LogoutButton />}
      </ButtonGroup>
    </Stack>
  );
};
