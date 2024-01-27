import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FileUploadForm } from "./components/FileUploadForm";
import { LogoutButton } from "./components/LogoutButton";
import { axiosInstance } from "./lib/axios";

export const App = () => {
  const { isAuthenticated } = useAuth0();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const handleTestQueueRequest = async () => {
    const response = await axiosInstance.post("/queue", {
      data: text,
    });
    console.log(response.data);
  };

  const handleGetFilesRequest = async () => {
    const response = await axiosInstance.get("/files");
    const files = response.data.files;
    console.log(response.data.files);
    setFiles(files);
  };
  return (
    <Stack direction="column" spacing={2} padding={2}>
      <FileUploadForm />
      <Stack direction="row" spacing={2}>
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
          <Button variant="outlined" onClick={handleGetFilesRequest}>
            Get Files
          </Button>
          {isAuthenticated && <LogoutButton />}
        </ButtonGroup>
      </Stack>
      <Typography variant="h5">Files</Typography>
      <List>
        {files &&
          files.map((file: any) => {
            return (
              <ListItem key={file.id} divider alignItems="center">
                <ListItemText primary={file.name} secondary={file.id} />
              </ListItem>
            );
          })}
      </List>
    </Stack>
  );
};
