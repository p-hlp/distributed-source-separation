import { Box, CircularProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AudioPlayerV2 } from "../components/AudioPlayerV2";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";
import { filesApi } from "./api/filesApi";

export const PlayerContainer = () => {
  const currentFileId = useActiveFileStore.use.fileId();
  const currentChildFileId = useActiveFileStore.use.childFileId();
  const currentLibraryId = useActiveLibraryStore.use.libraryId();
  const api = filesApi(currentLibraryId ?? "");

  const actualFileId = currentChildFileId || currentFileId;

  const {
    data: file,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: ["playFile", currentLibraryId, actualFileId],
    queryFn: () => api.GET(actualFileId!),
    enabled: Boolean(actualFileId) && Boolean(currentLibraryId),
  });

  if (!file && isPending && isFetching) {
    return (
      <Box width={"100%"} height={"100%"}>
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
