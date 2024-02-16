// FileItem.tsx
import {
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import { memo } from "react";
import { AudioFileResponse } from "../shared/types";
import { AudioPlayerWavesurfer } from "./AudioPlayerWavesurfer";

interface FileItemProps {
  file: AudioFileResponse;
  isOpen: boolean;
  toggleStems: () => void;
}

export const FileItem = memo(({ file, isOpen, toggleStems }: FileItemProps) => {
  return (
    <ListItem sx={{ pl: 2, pr: 6 }} divider alignItems="center">
      <Stack direction="column" spacing={2} flexGrow={1}>
        <ListItemText primary={file.name} />
        <AudioPlayerWavesurfer
          filePath={file.filePath}
          peaks={[file.waveform.data]}
          duration={file.waveform.length / file.waveform.sample_rate}
          height={96}
        />
        {file.stems && file.stems.length > 0 && (
          <>
            <Button onClick={toggleStems} variant="outlined">
              {isOpen ? "Hide Stems" : "Show Stems"}
            </Button>
            <Collapse in={isOpen}>
              <List dense>
                {file.stems.map((stem) => (
                  <ListItem key={stem.id} sx={{ pl: 4 }}>
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{ width: "100%" }}
                    >
                      <ListItemText primary={stem.name} />
                      <AudioPlayerWavesurfer
                        filePath={stem.filePath}
                        peaks={[stem.waveform.data]}
                        duration={
                          stem.waveform.length / stem.waveform.sample_rate
                        }
                        height={64}
                      />
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </Stack>
    </ListItem>
  );
});
