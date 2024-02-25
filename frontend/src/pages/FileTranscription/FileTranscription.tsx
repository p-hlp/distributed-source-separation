import { Box, Divider, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { SectionBar } from "../../components/SectionBar";
import { useSelectedFileId } from "../../hooks/useSelectedFileId";
import { getTranscription } from "./api";

export const FileTranscription = () => {
  const { selectedFileId } = useSelectedFileId();

  const { data: transcription } = useQuery({
    queryKey: ["transcription", selectedFileId],
    queryFn: () => getTranscription(selectedFileId!),
    enabled: Boolean(selectedFileId),
  });

  return (
    <Stack width={"100%"} height={"100%"} direction="column">
      <SectionBar sectionTitle="File Transcription" />
      <Divider />
      <Box width={"100%"} height={"100%"} overflow="auto" p={1}>
        {!transcription && "Show transcription when vocal file is selected."}
        {transcription && <pre>{transcription.text}</pre>}
      </Box>
    </Stack>
  );
};
