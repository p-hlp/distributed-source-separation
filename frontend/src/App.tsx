import { DownloadOutlined } from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  Divider,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AudioPlayer } from "./components/AudioPlayer";
import { FileUploadForm } from "./components/FileUploadForm";
import { MenuBar } from "./components/MenuBar";
import { SSEComponent } from "./components/SSEComponent";
import { axiosInstance, rawAxiosInstance } from "./lib";
import { queryClient } from "./main";
import { AudioFileResponse, MidiFileResponse } from "./shared/types";

const listFilesAPI = async (): Promise<AudioFileResponse[]> => {
  const response = await axiosInstance.get<AudioFileResponse[]>("/files");
  return response.data;
};

interface MidiConversionState {
  [key: string]: boolean;
}

export const App = () => {
  const [selectedFile, setSelectedFile] = useState<AudioFileResponse | null>(
    null
  );
  const [openStems, setOpenStems] = useState<{ [key: string]: boolean }>({});
  const [separationInProgress, setSeparationInProgress] =
    useState<boolean>(false);

  const [midiConversionInProgress, setMidiConversionInProgress] =
    useState<MidiConversionState>({});

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
    setSeparationInProgress(true);
    console.log(response.data);
  };

  const toggleMidiConversion = (fileId: string) => {
    setMidiConversionInProgress((prevMidiConversionInProgress) => ({
      ...prevMidiConversionInProgress,
      [fileId]: !prevMidiConversionInProgress[fileId],
    }));
  };

  const handcleToMidiConversion = async (fileId: string) => {
    if (midiConversionInProgress[fileId]) return;
    toggleMidiConversion(fileId);
    const response = await axiosInstance.post("/audio-to-midi", {
      data: fileId,
    });
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

  const onSSEMessage = useCallback(
    (message: string, toggleSeparationProgress: boolean) => {
      toast(message, { type: "info" });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      if (toggleSeparationProgress) setSeparationInProgress(false);
    },
    []
  );

  const handleDownloadMidi = async (midiFile: MidiFileResponse | undefined) => {
    if (!midiFile) return;
    const response = await axiosInstance.get("signed/" + midiFile.filePath);
    const minioUrl = response.data.url;
    const minioResponse = await rawAxiosInstance.get(minioUrl, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([minioResponse.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", midiFile.name);
    document.body.appendChild(link);
    link.click();
  };

  const handleTranscribe = async (audioFile: AudioFileResponse) => {
    const response = await axiosInstance.post("/transcribe", {
      data: audioFile.id,
    });
    console.log(response.data);
  };

  return (
    <Stack direction="column" sx={{ padding: 0 }}>
      <MenuBar />
      <Box p={1}>
        <SSEComponent onMessage={onSSEMessage} />
        <FileUploadForm
          onFileUpload={() => {
            queryClient.invalidateQueries({ queryKey: ["files"] });
          }}
        />
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
            <Button
              onClick={handleFileSeparation}
              disabled={separationInProgress}
            >
              {!separationInProgress && (
                <Typography variant="body1">Separate</Typography>
              )}
              {separationInProgress && <CircularProgress size={24} />}
            </Button>
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
              files
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((file) => (
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
                        {file.stems
                          ?.sort((a, b) => a.name.localeCompare(b.name))
                          .map((stem) => (
                            <ListItem
                              key={stem.id}
                              divider
                              sx={{ pl: 4, pr: 6 }}
                            >
                              <Stack direction="column" sx={{ width: "100%" }}>
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
                                  <ButtonGroup variant="outlined">
                                    {!stem.midiFile && (
                                      <Button
                                        variant="outlined"
                                        onClick={() =>
                                          handcleToMidiConversion(stem.id)
                                        }
                                        disabled={
                                          midiConversionInProgress[stem.id]
                                        }
                                      >
                                        {midiConversionInProgress[stem.id] ? (
                                          <CircularProgress size={24} />
                                        ) : (
                                          "to Midi"
                                        )}
                                      </Button>
                                    )}
                                    {stem.midiFile && (
                                      <Button
                                        variant="outlined"
                                        onClick={() =>
                                          handleDownloadMidi(stem.midiFile)
                                        }
                                        startIcon={<DownloadOutlined />}
                                      >
                                        {"Midi"}
                                      </Button>
                                    )}
                                    {!stem.transcription && (
                                      <Button
                                        variant="outlined"
                                        onClick={() => handleTranscribe(stem)}
                                      >
                                        Transcribe
                                      </Button>
                                    )}
                                  </ButtonGroup>
                                </Stack>
                                {stem.transcription && (
                                  <Stack
                                    py={1}
                                    direction="column"
                                    sx={{ width: "100%" }}
                                    spacing={1}
                                  >
                                    <Divider />
                                    <Typography variant="h5">
                                      Transcription
                                    </Typography>
                                    <Typography variant="body2">
                                      {stem?.transcription?.text}
                                    </Typography>
                                  </Stack>
                                )}
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
      </Box>
    </Stack>
  );
};
