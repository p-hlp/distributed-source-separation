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
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  const [selectedFile, setSelectedFile] = useState<AudioFileResponse | null>(
    null
  );
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

  const handleFileSeparation = async () => {
    if (!selectedFile) return;
    const response = await axiosInstance.post("/separate", {
      data: selectedFile.id,
    });
    setSelectedFile(null);
    console.log(response.data);
  };

  const toggleStems = (fileId: string) => {
    setOpenStems((prevOpenStems) => ({
      ...prevOpenStems,
      [fileId]: !prevOpenStems[fileId],
    }));
  };

  const selectableFiles = useMemo(() => {
    console.log("selectableFiles changed", files);
    return files?.filter((file) => !file.parentId && !file.stems?.length) || [];
  }, [files]);

  useEffect(() => {
    if (selectableFiles.length > 0 && !selectedFile) {
      setSelectedFile(selectableFiles[0]);
    }
  }, [selectableFiles, selectedFile]);

  return (
    <Stack direction="column" spacing={2} padding={2}>
      <FileUploadForm />
      <Stack direction="row" spacing={2}>
        <Select
          sx={{ maxWidth: 400 }}
          labelId="select-file-label"
          id="select-file"
          value={selectedFile?.id || ""}
          onChange={(event) => {
            const file = selectableFiles.find(
              (f) => f.id === event.target.value
            );
            setSelectedFile(file || null);
          }}
        >
          {selectableFiles.map((file) => (
            <MenuItem key={file.id} value={file.id}>
              {file.name}
            </MenuItem>
          ))}
        </Select>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <Button onClick={handleFileSeparation}>Separate</Button>
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
                      <ListItem key={stem.id} divider sx={{ pl: 4, pr: 6 }}>
                        <Stack
                          direction="row"
                          spacing={4}
                          sx={{ width: "100%" }}
                        >
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
