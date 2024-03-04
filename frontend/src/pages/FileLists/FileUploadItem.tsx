import { UploadFile } from "@mui/icons-material";
import {
  CircularProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ChangeEvent, useRef, useState } from "react";
import { sanitize } from "../../shared/stringUtils";

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
    const files = event.target.files;
    if (!files || !files?.length) return;
    setIsUploading(true);
    const formData = new FormData();

    for (const file of files) {
      formData.append("files", file, sanitize(file.name));
    }

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
        <ListItemText primary="Upload Files" />
        {isUploading && (
          <ListItemIcon>
            <CircularProgress size={24} color="primary" />
          </ListItemIcon>
        )}
      </ListItemButton>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(event) => handleFileChange(event)}
      />
    </div>
  );
};
