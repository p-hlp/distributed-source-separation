import { Download } from "@mui/icons-material";
import {
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useIconColors } from "../../components/Icons";
import { SectionBar } from "../../components/SectionBar";
import { axiosInstance } from "../../lib";
import { queryClient } from "../../lib/queryClient";
import { useActiveFileStore } from "../../store/activeFileStore";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { AudioFileResponse } from "../../types";
import { filesApi } from "../api/filesApi";
import { FileUploadItem } from "./FileUploadItem";
import { uploadItem } from "./utils";

export const ChildrenFileList = () => {
  const {
    fileId: currentMainFileId,
    childFileId: currentChildFileId,
    setChildFile,
  } = useActiveFileStore();
  const { libraryId: currentLibraryId } = useActiveLibraryStore();
  const api = filesApi(currentLibraryId ?? "");
  const [donwloadInProgress, setDownloadInProgress] = useState(false);
  const { lightIconColor } = useIconColors();

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

  const handleDonwload = async () => {
    if (!currentMainFileId) return;
    setDownloadInProgress(true);

    const mainFileResponse = await axiosInstance.get<AudioFileResponse>(
      `/api/libraries/${currentLibraryId}/files/${currentMainFileId}`
    );
    const mainFileName = mainFileResponse.data.name;
    const response = await axiosInstance.get(
      `/api/libraries/${currentLibraryId}/files/${currentMainFileId}/export`,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download", `${mainFileName}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadInProgress(false);
  };

  const disabled =
    donwloadInProgress || !currentMainFileId || !data || !data.length;

  return (
    <Stack direction="column" overflow="auto" maxHeight="100%">
      <SectionBar
        sectionTitle="Associated Files"
        endAdornment={
          <IconButton disabled={disabled} onClick={handleDonwload}>
            {donwloadInProgress ? (
              <CircularProgress size={24} sx={{ color: lightIconColor }} />
            ) : (
              <Download />
            )}
          </IconButton>
        }
      />
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
