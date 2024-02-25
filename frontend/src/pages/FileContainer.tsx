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
import { useCallback, useMemo } from "react";
import { FileUploadItem } from "../components/FileUploadForm";
import { queryClient } from "../lib/queryClient";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";
import { AudioFileResponse } from "../types";
import { filesApi } from "./api/filesApi";

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
      <Box sx={{ width: "50%" }}>
        <AssociatedFileList />
      </Box>
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
  const resetChildFile = useActiveFileStore.use.resetChildFile();

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
    resetChildFile();
  };

  const handleFileUploadComplete = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["mainFiles", libraryId],
    });
  };

  if (!mainFiles) return null;
  return (
    <Stack direction="column" overflow="auto" maxHeight="100%">
      <Typography variant="subtitle1" fontWeight={600} flexGrow={1} p={1}>
        Files
      </Typography>
      <Divider />
      <List disablePadding>
        {mainFiles.map((file) => {
          return file.id === "upload" ? (
            <FileUploadItem
              key={file.id}
              fileUploadRequest={api.POST}
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

const AssociatedFileList = () => {
  const currentMainFileId = useActiveFileStore.use.fileId();
  const currentChildFileId = useActiveFileStore.use.childFileId();
  const setChildFile = useActiveFileStore.use.setChildFile();
  const currentLibraryId = useActiveLibraryStore.use.libraryId();
  const api = filesApi(currentLibraryId ?? "");

  const { data } = useQuery({
    queryKey: ["childFiles", currentMainFileId],
    queryFn: () => api.GET_CHILDREN(currentMainFileId!),
    enabled: Boolean(currentMainFileId) && Boolean(currentLibraryId),
  });

  const childFiles = useMemo(() => {
    const dataToAdd = data ? data : [];
    return [uploadItem, ...dataToAdd];
  }, [data]);

  const handleFileUploadComplete = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["childFiles", currentMainFileId],
    });
  };

  const fileUploadRequest = useCallback(
    async (formData: FormData) => {
      if (!currentMainFileId) throw new Error("No main file selected");
      return api.POST_CHILD(currentMainFileId, formData);
    },
    [api, currentMainFileId]
  );

  return (
    <Stack direction="column" overflow="auto" maxHeight="100%">
      <Typography variant="subtitle1" fontWeight={600} flexGrow={1} p={1}>
        Associated Files
      </Typography>
      <Divider />
      <List disablePadding>
        {childFiles.map((file) => {
          return file.id === "upload" ? (
            <FileUploadItem
              key={file.id}
              disabled={!currentMainFileId}
              fileUploadRequest={(formData) => fileUploadRequest(formData)}
              onFileUploadComplete={handleFileUploadComplete}
            />
          ) : (
            <ListItemButton
              key={file.id}
              divider
              selected={file.id === currentChildFileId}
              onClick={() => setChildFile(file.id)}
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
