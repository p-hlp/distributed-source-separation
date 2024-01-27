import { Clear, CloudUploadOutlined } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";

export const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    console.log(formData);
    const response = await axiosInstance.post("/upload", formData);
    console.log(response);
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
