import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { AudioFileResponse } from "../shared/types"; // Adjust import path as needed

interface FileSelectionProps {
  selectedFile: AudioFileResponse | null;
  onSelectFile: (fileId: string) => void;
  selectableFiles: AudioFileResponse[];
  handleFileSeparation: () => Promise<void>;
  separationInProgress: boolean;
}

export const FileSelection: React.FC<FileSelectionProps> = ({
  selectedFile,
  onSelectFile,
  selectableFiles,
  handleFileSeparation,
  separationInProgress,
}) => (
  <Stack direction="row" spacing={2} py={2}>
    <Select
      displayEmpty
      value={selectedFile?.id || ""}
      onChange={(e) => onSelectFile(e.target.value as string)}
      sx={{ minWidth: 200 }}
      renderValue={(selected) => {
        if (selected === "") {
          return (
            <Typography variant="body2" color="textSecondary">
              Select a file...
            </Typography>
          );
        }
        return (
          selectableFiles.find((file) => file.id === selected)?.name ||
          "Select a file..."
        );
      }}
    >
      {selectableFiles.length > 0 ? (
        selectableFiles.map((file) => (
          <MenuItem key={file.id} value={file.id}>
            {file.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="" disabled>
          <Typography variant="body2" color="textSecondary">
            No files available
          </Typography>
        </MenuItem>
      )}
    </Select>
    <Button
      size="large"
      variant="outlined"
      onClick={handleFileSeparation}
      disabled={
        separationInProgress || selectableFiles.length === 0 || !selectedFile
      }
    >
      {!separationInProgress ? (
        <Typography>Separate</Typography>
      ) : (
        <CircularProgress size={24} />
      )}
    </Button>
  </Stack>
);
