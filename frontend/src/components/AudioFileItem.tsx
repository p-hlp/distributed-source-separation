// FileItem.tsx
import { Divider, ListItem, Stack, Typography, useTheme } from "@mui/material";
import { memo } from "react";
import { AudioFileResponse } from "../shared/types";
import { AudioPlayer } from "./AudioPlayer";

interface FileItemProps {
  file: AudioFileResponse;
}

export const FileItem = memo(({ file }: FileItemProps) => {
  const theme = useTheme();
  return (
    <ListItem
      divider
      alignItems="center"
      sx={{
        borderStyle: "solid",
        borderColor: theme.palette.divider,
        borderWidth: 1,
      }}
    >
      <Stack direction="column" spacing={2} flexGrow={1}>
        <Typography variant="subtitle2" pt={2}>
          {file.name}
        </Typography>
        <Divider variant="middle" />
        <AudioPlayer
          filePath={file.filePath}
          peaks={[file.waveform.data]}
          duration={file.waveform.length / file.waveform.sample_rate}
        />
      </Stack>
    </ListItem>
  );
});
