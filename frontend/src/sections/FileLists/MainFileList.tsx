import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SectionBar } from "../../components/SectionBar";
import { queryClient } from "../../lib/queryClient";
import { useActiveFileStore } from "../../store/activeFileStore";
import { filesApi } from "../api/filesApi";
import { FileUploadItem } from "./FileUploadItem";
import { uploadItem } from "./utils";

interface MainFileListProps {
  libraryId: string;
}

// TODO - Don't pass libraryId use from zustand store
export const MainFileList = ({ libraryId }: MainFileListProps) => {
  const api = filesApi(libraryId);
  const { setFile, fileId, resetChildFile } = useActiveFileStore();

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
    <Stack direction="column">
      <SectionBar sectionTitle="Files" />
      <Divider />
      <List disablePadding sx={{ overflow: "auto" }}>
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
