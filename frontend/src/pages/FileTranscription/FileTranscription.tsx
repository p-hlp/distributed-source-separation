import { Box, Divider, Stack, Typography } from "@mui/material";
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
      <Box width={"100%"} height={"100%"} p={1} overflow="auto">
        {!transcription && "Show transcription when vocal file is selected."}
        {transcription && (
          <Typography noWrap={false}>{transcription.text}</Typography>
        )}
      </Box>
    </Stack>
  );
};
