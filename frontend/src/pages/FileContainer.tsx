import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FileUploadItem } from "../components/FileUploadForm";
import { useActiveFileStore } from "../store/activeFileStore";
import { AudioFileResponse } from "../types";
import { filesApi } from "./api/filesApi";
import { queryClient } from "../lib/queryClient";

interface Props {
  libraryId: string;
}

export const FileContainer = ({ libraryId }: Props) => {
  return (
    <Stack direction="row" p={0} sx={{ width: "50%" }}>
      <Box sx={{ width: "50%" }}>
        <MainFileList libraryId={libraryId} />
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ width: "50%" }}>Files 2 </Box>
    </Stack>
  );
};

interface MainFileListProps {
  libraryId: string;
}

const uploadItem = {
  id: "upload",
} as AudioFileResponse;

const MainFileList = ({ libraryId }: MainFileListProps) => {
  const api = filesApi(libraryId);
  const fileId = useActiveFileStore.use.fileId();
  const setFile = useActiveFileStore.use.setFile();

  const { data } = useQuery({
    queryKey: ["mainFiles", libraryId],
    queryFn: () => api.GET_ALL(),
  });

  const mainFiles = useMemo(() => {
    if (!data) return undefined;
    return [uploadItem, ...data];
  }, [data]);

  const handleListItemClicked = (fileId: string) => {
    setFile(fileId);
  };

  const handleFileUploadComplete = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["mainFiles", libraryId],
    });
  };

  if (!mainFiles) return null;
  return (
    <Stack direction="column">
      <Typography variant="subtitle1" fontWeight={600} flexGrow={1} p={1}>
        Files
      </Typography>
      <Divider />
      <List disablePadding>
        {mainFiles.map((file) => {
          return file.id === "upload" ? (
            <FileUploadItem
              key={file.id}
              libraryId={libraryId}
              onFileUploadComplete={handleFileUploadComplete}
            />
          ) : (
            <ListItemButton
              key={file.id}
              divider
              selected={file.id === fileId}
              onClick={() => handleListItemClicked(file.id)}
            >
              <ListItemText
                primary={<Typography variant="body2">{file.name}</Typography>}
                disableTypography
              />
            </ListItemButton>
          );
        })}
      </List>
    </Stack>
  );
};
