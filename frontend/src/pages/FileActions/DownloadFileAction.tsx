import { Divider, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useSelectedFileId } from "../../hooks/useSelectedFileId";
import { downloadFileMinio, getAudioFile } from "./api";

export const DownloadFileAction = () => {
  const { selectedFileId, mainFileId } = useSelectedFileId();

  const disabled = !selectedFileId;

  const handleClick = async () => {
    if (!selectedFileId) {
      console.error("File not found");
      return;
    }

    if (mainFileId && mainFileId !== selectedFileId) {
      const mainFile = await getAudioFile(mainFileId);
      if (!mainFile) return;
      const childFile = await getAudioFile(selectedFileId);
      if (!childFile) return;
      const fileName = `${mainFile.name} - ${childFile.name}`;
      await downloadFileMinio(childFile.filePath, fileName);
    } else {
      const file = await getAudioFile(selectedFileId);
      if (!file) return;
      await downloadFileMinio(file.filePath, file.name);
    }
  };

  return (
    <Stack direction="column" width={"100%"}>
      <ListItemButton disabled={disabled} onClick={handleClick}>
        <ListItemText
          primary="Download File"
          secondary="Downloads the selected file"
        />
      </ListItemButton>
      <Divider />
    </Stack>
  );
};
