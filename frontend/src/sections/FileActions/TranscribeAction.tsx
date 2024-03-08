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

export const TransrcibeAction = () => {
  const { selectedFileId } = useSelectedFileId();
  const libraryId = useActiveLibraryStore.use.libraryId();

  const [inProgress, setInProgress] = useState(false);

  const { data: file } = useQuery({
    queryKey: ["audioFile", selectedFileId],
    queryFn: () => getAudioFile(selectedFileId!),
    enabled: Boolean(selectedFileId),
  });

  const isVocal = Boolean(file?.isVocal);
  const disabled =
    !selectedFileId || !libraryId || !file || !isVocal || inProgress;

  const handleClick = async () => {
    if (!file || file.id != selectedFileId) {
      console.error("File not found");
      return;
    }

    setInProgress(true);
    const response = await axiosInstance.post("/transcribe", {
      audioFileId: selectedFileId,
    });
    console.log("Transcribe response", response);
  };

  const transriptionHandler = useCallback(() => {
    setInProgress(false);
    if (!file) return;
    queryClient.invalidateQueries({ queryKey: ["transcription", file.id] });
    queryClient.invalidateQueries({ queryKey: ["audioFile", file.id] });
    queryClient.invalidateQueries({ queryKey: ["fileInfo", file.id] });
  }, [file]);

  useRegisterSSEListener([
    {
      type: "transcribe",
      status: "done",
      callback: transriptionHandler,
    },
  ]);

  return (
    <Stack direction="column" width={"100%"}>
      <ListItemButton disabled={disabled} onClick={handleClick}>
        <ListItemText
          primary="Transcribe (Vocals Only)"
          secondary="Transcribes selected vocal file using OpenAI Whisper"
        />
      </ListItemButton>
      {inProgress && <LinearProgress color="inherit" variant="indeterminate" />}
      <Divider />
    </Stack>
  );
};
