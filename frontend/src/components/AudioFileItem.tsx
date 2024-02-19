// FileItem.tsx
import { Divider, ListItem, Stack, Typography, useTheme } from "@mui/material";
import { memo, useMemo } from "react";
import { RegionParams } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { AudioFileResponse } from "../shared/types";
import { AudioPlayer } from "./AudioPlayer";
interface FileItemProps {
  file: AudioFileResponse;
}

export const FileItem = memo(({ file }: FileItemProps) => {
  const theme = useTheme();

  const regions: RegionParams[] = useMemo(() => {
    return file.slices.map((slice) => {
      const end = slice.end ?? undefined;
      return {
        id: slice.sliceId,
        start: slice.start,
        end: end,
        color: slice.color,
        content: slice.name,
      };
    });
  }, [file]);

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
          audioFileId={file.id}
          filePath={file.filePath}
          peaks={[file.waveform.data]}
          duration={file.waveform.length / file.waveform.sample_rate}
          existingRegions={regions}
        />
      </Stack>
    </ListItem>
  );
});
