import {
  Divider,
  LinearProgress,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRegisterSSEListener } from "../../hooks/useRegisterSSEListener";
import { axiosInstance } from "../../lib";
import { queryClient } from "../../lib/queryClient";
import { useActiveFileStore } from "../../store/activeFileStore";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { getAudioFile } from "./api";

export const SeparationAction = () => {
  const { fileId, childFileId } = useActiveFileStore();
  const activeFileId = childFileId ?? fileId;
  const { libraryId } = useActiveLibraryStore();

  const [inProgress, setInProgress] = useState(false);

  const { data: file } = useQuery({
    queryKey: ["audioFile", activeFileId],
    queryFn: () => getAudioFile(activeFileId!),
    enabled: Boolean(activeFileId),
  });

  const disabled =
    !activeFileId || !libraryId || !file || file.isSeparated || inProgress;

  const handleClick = async () => {
    if (!file || file.id != activeFileId) {
      console.error("File not found");
      return;
    }

    setInProgress(true);
    const response = await axiosInstance.post("/separate", {
      audioFileId: activeFileId,
      libraryId: libraryId,
    });
    console.log(response);
  };

  const separationHandler = useCallback(() => {
    setInProgress(false);
    if (!file) return;
    queryClient.invalidateQueries({ queryKey: ["childFiles", file.id] });
  }, [file]);

  useRegisterSSEListener([
    {
      type: "separate",
      status: "done",
      callback: separationHandler,
    },
  ]);

  return (
    <Stack direction="column" width={"100%"}>
      <ListItemButton disabled={disabled} onClick={handleClick}>
        <ListItemText
          primary="Separate"
          secondary="Separates selected file into stems using DemucsHT"
        />
      </ListItemButton>
      {inProgress && <LinearProgress color="inherit" variant="indeterminate" />}
      <Divider />
    </Stack>
  );
};
