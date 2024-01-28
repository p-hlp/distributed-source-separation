import { useAuth0 } from "@auth0/auth0-react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { AudioPlayer } from "./components/AudioPlayer";
import { FileUploadForm } from "./components/FileUploadForm";
import { LogoutButton } from "./components/LogoutButton";
import { axiosInstance } from "./lib";
import { AudioFileResponse } from "./shared/types";

const listFilesAPI = async (): Promise<AudioFileResponse[]> => {
  const response = await axiosInstance.get<AudioFileResponse[]>("/files");
  return response.data;
};

export const App = () => {
  const { isAuthenticated } = useAuth0();
  const [text, setText] = useState<string>("");
  const [openStems, setOpenStems] = useState<{ [key: string]: boolean }>({});

  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery<AudioFileResponse[], Error>({
    queryKey: ["files"],
    queryFn: listFilesAPI,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleTestQueueRequest = async () => {
    const response = await axiosInstance.post("/separate", {
      data: text,
    });
    console.log(response.data);
  };

  const toggleStems = (fileId: string) => {
    setOpenStems((prevOpenStems) => ({
      ...prevOpenStems,
      [fileId]: !prevOpenStems[fileId],
    }));
  };

  return (
    <Stack direction="column" spacing={2} padding={2}>
      <FileUploadForm />
      <Stack direction="row" spacing={2}>
        <TextField
          id="text-input"
          label="AudioFileID"
          value={text}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value);
          }}
        />
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <Button onClick={handleTestQueueRequest}>Separate</Button>
          {isAuthenticated && <LogoutButton />}
        </ButtonGroup>
      </Stack>
      <Stack direction="row" spacing={2} paddingTop={2}>
        <Typography variant="h5">Files</Typography>
        <Button variant="outlined" onClick={() => refetch()}>
          Refresh
        </Button>
      </Stack>
      {files && (
        <List dense>
          {files.length > 0 &&
            files.map((file) => (
              <div key={file.id}>
                <ListItem
                  key={file.id}
                  divider
                  alignItems="center"
                  secondaryAction={
                    file.stems &&
                    file.stems.length > 0 && (
                      <IconButton
                        edge="end"
                        aria-label="toggle stems"
                        onClick={() => toggleStems(file.id)}
                      >
                        {openStems[file.id] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    )
                  }
                >
                  <ListItemText primary={file.name} secondary={file.id} />
                  <AudioPlayer filePath={file.filePath} />
                </ListItem>
                <Collapse
                  in={openStems[file.id] ?? false}
                  timeout="auto"
                  unmountOnExit
                >
                  <List dense>
                    {file.stems?.map((stem) => (
                      <ListItem key={stem.id} divider sx={{ pl: 4 }}>
                        <Stack direction="column">
                          <ListItemText
                            primary={stem.name}
                            secondary={stem.id}
                          />
                          <AudioPlayer filePath={stem.filePath} />
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          {files.length === 0 && (
            <Typography variant="body1">No files found.</Typography>
          )}
        </List>
      )}
      {isLoading && <CircularProgress />}
    </Stack>
  );
};
