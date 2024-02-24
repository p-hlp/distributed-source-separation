import { Box, CircularProgress, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AudioPlayerV2 } from "../components/AudioPlayerV2";
import { filesApi } from "./api/filesApi";

interface Props {
  libraryId: string;
  fileId: string;
}

export const PlayerContainer = ({ libraryId, fileId }: Props) => {
  const api = filesApi(libraryId);
  console.log("fileId: ", fileId);

  const { data: file } = useQuery({
    queryKey: ["file", libraryId, fileId],
    queryFn: () => api.GET(fileId),
  });

  if (!file)
    return (
      <Box width={"100%"} height={"100%"}>
        <CircularProgress />
      </Box>
    );

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
