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
import { useSelectedFileId } from "../../hooks/useSelectedFileId";
import { axiosInstance } from "../../lib";
import { queryClient } from "../../lib/queryClient";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { getAudioFile } from "./api";

export const SeparationAction = () => {
  const { selectedFileId } = useSelectedFileId();
  const libraryId = useActiveLibraryStore.use.libraryId();

  const [inProgress, setInProgress] = useState(false);

  const { data: file } = useQuery({
    queryKey: ["audioFile", selectedFileId],
    queryFn: () => getAudioFile(selectedFileId!),
    enabled: Boolean(selectedFileId),
  });

  const disabled =
    !selectedFileId || !libraryId || !file || file.isSeparated || inProgress;

  const handleClick = async () => {
    if (!file || file.id != selectedFileId) {
      console.error("File not found");
      return;
    }

    setInProgress(true);
    const response = await axiosInstance.post("/separate", {
      audioFileId: selectedFileId,
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
