import { Divider, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useActiveFileStore } from "../../store/activeFileStore";
import { downloadFileMinio, getAudioFile } from "./api";

export const DownloadFileAction = () => {
  const { fileId: mainFileId, childFileId } = useActiveFileStore();
  const activeFileId = childFileId ?? mainFileId;

  const disabled = !activeFileId;

  const handleClick = async () => {
    if (!activeFileId) {
      console.error("File not found");
      return;
    }

    if (mainFileId && mainFileId !== activeFileId) {
      const mainFile = await getAudioFile(mainFileId);
      if (!mainFile) return;
      const childFile = await getAudioFile(activeFileId);
      if (!childFile) return;
      const fileName = `${mainFile.name} - ${childFile.name}`;
      await downloadFileMinio(childFile.filePath, fileName);
    } else {
      const file = await getAudioFile(activeFileId);
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
