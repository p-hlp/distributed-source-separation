// FileList.tsx

import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { AudioFileResponse, MidiFileResponse } from "../shared/types";
import { AudioPlayer } from "./AudioPlayer";

interface FileListProps {
  files: AudioFileResponse[];
  openStems: { [key: string]: boolean };
  toggleStems: (fileId: string) => void;
  midiConversionInProgress: { [key: string]: boolean };
  handleToMidiConversion: (fileId: string) => Promise<void>;
  handleDownloadMidi: (midiFile: MidiFileResponse | undefined) => Promise<void>;
  handleTranscribe: (audioFile: AudioFileResponse | undefined) => Promise<void>;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  openStems,
  toggleStems,
  midiConversionInProgress,
  handleToMidiConversion,
  handleDownloadMidi,
  handleTranscribe,
}) => (
  <List dense>
    {files.length > 0 &&
      files
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => (
          <React.Fragment key={file.id}>
            <ListItem
              sx={{ pl: 2, pr: 6 }}
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
              <ListItemText primary={file.name} />
              <AudioPlayer filePath={file.filePath} />
            </ListItem>
            <Collapse
              in={openStems[file.id] ?? false}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {file.stems
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map((stem) => (
                    <ListItem key={stem.id} divider sx={{ pl: 4, pr: 6 }}>
                      <Stack
                        direction="column"
                        sx={{ width: "100%" }}
                        alignItems="center"
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <ListItemText primary={stem.name} />
                          <AudioPlayer filePath={stem.filePath} />
                          <ButtonGroup variant="outlined">
                            {!stem.midiFile && (
                              <Button
                                variant="outlined"
                                onClick={() => handleToMidiConversion(stem.id)}
                                disabled={midiConversionInProgress[stem.id]}
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
                                Midi
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
                          <Box>
                            <Typography variant="h6" sx={{ pt: 1 }}>
                              Transcription
                            </Typography>
                            <Typography variant="body2">
                              {stem.transcription.text}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </ListItem>
                  ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
    {files.length === 0 && (
      <Typography variant="body1">No files found.</Typography>
    )}
  </List>
);
