import { Clear, CloudUploadOutlined, UploadFile } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import { ChangeEvent, useRef, useState } from "react";
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

interface FileUploadItemProps {
  fileUploadRequest: (formData: FormData) => Promise<any>;
  onFileUploadComplete?: () => void;
  disabled?: boolean;
}

export const FileUploadItem = ({
  fileUploadRequest,
  onFileUploadComplete,
  disabled,
}: FileUploadItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const sanitizedFileName = sanitize(file.name);
    const formData = new FormData();
    formData.append("file", file, sanitizedFileName);
    const response = await fileUploadRequest(formData);
    if (response) {
      setIsUploading(false);
      onFileUploadComplete && onFileUploadComplete();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div key={"uploadItem"}>
      <ListItemButton
        divider
        onClick={handleClick}
        disabled={isUploading || disabled}
      >
        <ListItemIcon>
          <UploadFile />
        </ListItemIcon>
        <ListItemText primary="Upload File" />
        {isUploading && (
          <ListItemIcon>
            <CircularProgress size={24} color="primary" />
          </ListItemIcon>
        )}
      </ListItemButton>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(event) => handleFileChange(event)}
      />
    </div>
  );
};
