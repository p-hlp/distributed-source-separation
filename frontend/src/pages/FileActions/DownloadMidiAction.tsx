import {
  Divider,
  LinearProgress,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useRegisterSSEListener } from "../../hooks/useRegisterSSEListener";
import { useSelectedFileId } from "../../hooks/useSelectedFileId";
import { axiosInstance } from "../../lib";
import { downloadFileMinio, getMidiFile } from "./api";

export const DownloadMidiAction = () => {
  const { selectedFileId } = useSelectedFileId();

  const [inProgress, setInProgress] = useState(false);

  const disabled = !selectedFileId || inProgress;

  const handleClick = async () => {
    if (!selectedFileId) {
      console.error("File not found");
    }
    const job = await axiosInstance.post("/midi", {
      audioFileId: selectedFileId,
    });

    console.log("Midi conversion job", job);

    // Queue the midi conversion job
    setInProgress(true);
  };

  const midiDownloadHandler = useCallback(async () => {
    if (!selectedFileId) return;
    console.log("Downloading midi for file", selectedFileId);
    // Get midi file for selectedFileId
    const midiFile = await getMidiFile(selectedFileId!);
    if (!midiFile) return;
    await downloadFileMinio(midiFile.filePath, midiFile.name);
    setInProgress(false);
  }, [selectedFileId]);

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
