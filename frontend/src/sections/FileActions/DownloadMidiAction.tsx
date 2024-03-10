import {
  Divider,
  LinearProgress,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useRegisterSSEListener } from "../../hooks/useRegisterSSEListener";
import { axiosInstance } from "../../lib";
import { useActiveFileStore } from "../../store/activeFileStore";
import { downloadFileMinio, getMidiFile } from "./api";

export const DownloadMidiAction = () => {
  const { fileId, childFileId } = useActiveFileStore();
  const activeFileId = childFileId ?? fileId;

  const [inProgress, setInProgress] = useState(false);

  const disabled = !activeFileId || inProgress;

  const handleClick = async () => {
    if (!activeFileId) {
      console.error("File not found");
    }
    const job = await axiosInstance.post("/midi", {
      audioFileId: activeFileId,
    });

    console.log("Midi conversion job", job);

    // Queue the midi conversion job
    setInProgress(true);
  };

  const midiDownloadHandler = useCallback(async () => {
    if (!activeFileId) return;
    console.log("Downloading midi for file", activeFileId);
    // Get midi file for activeFileId
    const midiFile = await getMidiFile(activeFileId!);
    if (!midiFile) return;
    await downloadFileMinio(midiFile.filePath, midiFile.name);
    setInProgress(false);
  }, [activeFileId]);

  useRegisterSSEListener([
    {
      type: "midi",
      status: "done",
      callback: midiDownloadHandler,
    },
  ]);

  return (
    <Stack direction="column" width={"100%"}>
      <ListItemButton disabled={disabled} onClick={handleClick}>
        <ListItemText
          primary="Download MIDI"
          secondary="Converts selected file to MIDI using Spotify Basic-Pitch"
        />
      </ListItemButton>
      {inProgress && <LinearProgress color="inherit" variant="indeterminate" />}
      <Divider />
    </Stack>
  );
};
