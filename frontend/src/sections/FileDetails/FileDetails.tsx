import { Box, Divider, Stack, Typography, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { SectionBar } from "../../components/SectionBar";
import { useSelectedFileId } from "../../hooks/useSelectedFileId";
import { formatDuration } from "../../shared/timeUtils";
import { getFileInfo } from "./api";

const NotSelectedComponent = () => {
  return (
    <Box width={"100%"} height={"100%"} p={1}>
      Select a file to show details.
    </Box>
  );
};

const formatIsoDate = (date: string) => {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export const FileDetails = () => {
  const { selectedFileId } = useSelectedFileId();

  const { data: fileInfo } = useQuery({
    queryKey: ["fileInfo", selectedFileId],
    queryFn: () => getFileInfo(selectedFileId!),
    enabled: Boolean(selectedFileId),
  });

  return (
    <Stack width={"100%"} height={"100%"} direction="column">
      <SectionBar sectionTitle="File Details" />
      <Divider />
      {fileInfo ? (
        <Box width={"100%"} height={"100%"}>
          <Stack spacing={1} direction="column" p={2}>
            <InfoItem title="Name" value={fileInfo.name} />
            <InfoItem title="File Type" value={fileInfo.fileType} />
            <InfoItem
              title="Duration"
              value={formatDuration(fileInfo.durationInSeconds)}
            />
            <InfoItem title="Library" value={fileInfo.libraryName} />
            <InfoItem title="Parent" value={fileInfo.parentName || "None"} />
            <InfoItem title="Has Midi" value={fileInfo.hasMidi.toString()} />
            <InfoItem
              title="Has Transcription"
              value={fileInfo.hasTranscription.toString()}
            />
            <InfoItem
              title="Created At"
              value={formatIsoDate(fileInfo.createdAt)}
            />
            <InfoItem
              title="Updated At"
              value={formatIsoDate(fileInfo.updatedAt)}
            />
          </Stack>
        </Box>
      ) : (
        <NotSelectedComponent />
      )}
    </Stack>
  );
};

const InfoItem = ({ title, value }: { title: string; value: string }) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      spacing={1}
      textOverflow="ellipsis"
      overflow="hidden"
      alignItems="flex-end"
    >
      <Typography>{title}:</Typography>
      <Typography variant="body2" noWrap color={theme.palette.text.secondary}>
        {value}
      </Typography>
    </Stack>
  );
};
