import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { FileUploadItem } from "../../components/FileUploadForm";
import { SectionBar } from "../../components/SectionBar";
import { queryClient } from "../../lib/queryClient";
import { useActiveFileStore } from "../../store/activeFileStore";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { filesApi } from "../api/filesApi";
import { uploadItem } from "./utils";

export const ChildrenFileList = () => {
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
      <SectionBar sectionTitle="Associated Files" />
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
