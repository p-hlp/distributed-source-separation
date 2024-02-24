import { List, Typography } from "@mui/material";
import { FileItem } from "./AudioFileItem";
import { AudioFileResponse, MidiFileResponse } from "../types/apiTypes";

interface FileListProps {
  files: AudioFileResponse[];
  openStems: { [key: string]: boolean };
  toggleStems: (fileId: string) => void;
  midiConversionInProgress: { [key: string]: boolean };
  handleToMidiConversion: (fileId: string) => Promise<void>;
  handleDownloadMidi: (midiFile: MidiFileResponse | undefined) => Promise<void>;
  handleTranscribe: (audioFile: AudioFileResponse | undefined) => Promise<void>;
}

export const FileList = ({ files }: FileListProps) => {
  return (
    <List dense>
      {files.length > 0 ? (
        files
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => <FileItem key={file.id} file={file} />)
      ) : (
        <Typography variant="body1">No files found.</Typography>
      )}
    </List>
  );
};
