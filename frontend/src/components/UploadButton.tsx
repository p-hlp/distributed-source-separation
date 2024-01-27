import { Button } from "@mui/material";
import { useRef } from "react";

export const UploadButton = () => {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <input
        ref={uploadInputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={() => {}}
      />
      <Button
        onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
        variant="contained"
      >
        Upload
      </Button>
    </>
  );
};
