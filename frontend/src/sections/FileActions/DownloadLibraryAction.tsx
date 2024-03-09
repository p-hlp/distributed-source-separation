import {
  Divider,
  LinearProgress,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { axiosInstance } from "../../lib";
import { useActiveLibraryStore } from "../../store/activeLibraryStore";
import { Library } from "../../types";

export const DownloadLibraryAction = () => {
  const selectedLibraryId = useActiveLibraryStore.use.libraryId();
  const [inProgress, setInprogress] = useState(false);

  const handleExportLibrary = async () => {
    if (!selectedLibraryId) return;
    setInprogress(true);
    try {
      const libraryResponse = await axiosInstance.get<Library>(
        `/api/libraries/${selectedLibraryId}/dense`
      );
      const libraryName = libraryResponse.data.name;
      const response = await axiosInstance.get(
        `/api/libraries/${selectedLibraryId}/export`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `${libraryName}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    } finally {
      setInprogress(false);
    }
  };

  return (
    <Stack direction="column" width={"100%"}>
      <ListItemButton onClick={handleExportLibrary}>
        <ListItemText
          primary="Download Library"
          secondary="Downloads the current library as a zip file."
        />
      </ListItemButton>
      {inProgress && <LinearProgress color="inherit" variant="indeterminate" />}
      <Divider />
    </Stack>
  );
};
