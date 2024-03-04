import { Clear, CloudUploadOutlined } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { sanitize } from "../shared/stringUtils";

interface Props {
  libraryId: string;
  onFileUploadComplete?: () => void;
}

export const FileUploadForm = ({ libraryId, onFileUploadComplete }: Props) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const sanitizedFileName = sanitize(file.name);
    const formData = new FormData();
    formData.append("file", file, sanitizedFileName);
    const response = await axiosInstance.post(
      `/api/libraries/${libraryId}/files`,
      formData
    );
    if (response) {
      onFileUploadComplete && onFileUploadComplete();
      setFile(null);
    }
  };

  return (
    <form>
      <Stack direction="row" spacing={2}>
        <MuiFileInput
          value={file}
          inputProps={{ accept: "audio/*" }}
          placeholder="Chose a file"
          onChange={handleFileChange}
          hideSizeText
          clearIconButtonProps={{
            "aria-label": "clear",
            title: "Clear",
            children: <Clear fontSize="small" />,
          }}
        />
        <Button
          disabled={!file}
          variant="outlined"
          startIcon={<CloudUploadOutlined />}
          onClick={handleFileUpload}
        >
          Upload
        </Button>
      </Stack>
    </form>
  );
};
