// FileListWavesurfer.tsx

import { List, Typography } from "@mui/material";
import React from "react";
import { AudioFileResponse, MidiFileResponse } from "../shared/types";
import { FileItem } from "./AudioFileItem";

interface FileListProps {
  files: AudioFileResponse[];
  openStems: { [key: string]: boolean };
  toggleStems: (fileId: string) => void;
  midiConversionInProgress: { [key: string]: boolean };
  handleToMidiConversion: (fileId: string) => Promise<void>;
  handleDownloadMidi: (midiFile: MidiFileResponse | undefined) => Promise<void>;
  handleTranscribe: (audioFile: AudioFileResponse | undefined) => Promise<void>;
}

export const FileListWavesurfer: React.FC<FileListProps> = ({
  files,
  openStems,
  toggleStems,
  midiConversionInProgress,
  handleToMidiConversion,
  handleDownloadMidi,
  handleTranscribe,
}) => {
  return (
    <List dense>
      {files.length > 0 ? (
        files
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => (
            <FileItem
              key={file.id}
              file={file}
              isOpen={!!openStems[file.id]}
              toggleStems={() => toggleStems(file.id)}
              // Pass any other props needed by FileItem if you extend its functionality
            />
          ))
      ) : (
        <Typography variant="body1">No files found.</Typography>
      )}
    </List>
  );
};

export default FileListWavesurfer;
