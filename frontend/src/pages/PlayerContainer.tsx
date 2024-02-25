import { Box, CircularProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AudioPlayerV2 } from "../components/AudioPlayerV2";
import { useSelectedFileId } from "../hooks/useSelectedFileId";
import { getAudioFile } from "./FileActions/api";

export const PlayerContainer = () => {
  const { selectedFileId } = useSelectedFileId();

  const {
    data: file,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: ["audioFile", selectedFileId],
    queryFn: () => getAudioFile(selectedFileId!),
    enabled: Boolean(selectedFileId),
  });

  if (!file && isPending && isFetching) {
    return (
      <Box
        width={"100%"}
        height={"100%"}
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  } else if (!file) return <Box p={2}>No file selected.</Box>;

  return (
    <Stack direction="column" sx={{ width: "100%", height: "100%" }}>
      <AudioPlayerV2
        audioFileId={file.id}
        filePath={file.filePath}
        peaks={[file.waveform.data]}
        duration={file.waveform.length / file.waveform.sample_rate}
        existingRegions={[]}
      />
    </Stack>
  );
};
