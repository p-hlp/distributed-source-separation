import { Box, Divider, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { SectionBar } from "../../components/SectionBar";
import { useActiveFileStore } from "../../store/activeFileStore";
import { getTranscription } from "./api";

export const FileTranscription = () => {
  const { fileId, childFileId } = useActiveFileStore();
  const activeFileId = childFileId ?? fileId;
  const { data: transcription } = useQuery({
    queryKey: ["transcription", activeFileId],
    queryFn: () => getTranscription(activeFileId!),
    enabled: Boolean(activeFileId),
  });

  return (
    <Stack width={"100%"} height={"100%"} direction="column">
      <SectionBar sectionTitle="File Transcription" />
      <Divider />
      <Box width={"100%"} height={"100%"} p={1} overflow="auto">
        {!transcription && "Show transcription when vocal file is selected."}
        {transcription && (
          <Typography noWrap={false}>{transcription.text}</Typography>
        )}
      </Box>
    </Stack>
  );
};
