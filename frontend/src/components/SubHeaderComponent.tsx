import { Delete, Download, MoreVert } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { axiosInstance } from "../lib";
import { queryClient } from "../lib/queryClient";
import { downloadFileMinio, getAudioFile } from "../sections/FileActions/api";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

interface Props {
  title: string;
  fileId: string;
  isChildFile: boolean;
}

export const SubHeaderComponent = ({ title, fileId, isChildFile }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { fileId: mainFileId } = useActiveFileStore();
  const { libraryId } = useActiveLibraryStore();
  const { resetChildFile, resetFile } = useActiveFileStore();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteFile = async () => {
    try {
      await axiosInstance.delete(`/files/${fileId}`);
      if (isChildFile) {
        resetChildFile();
        queryClient.invalidateQueries({
          queryKey: ["childFiles", mainFileId],
        });
      } else {
        resetFile();
        queryClient.invalidateQueries({
          queryKey: ["mainFiles", libraryId],
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      handleClose();
    }
  };

  const handleDownloadFile = async () => {
    const file = await getAudioFile(fileId);
    if (!file) return;
    console.log("Downloading ", file);
    await downloadFileMinio(file.preSignedUrl, file.name);
    handleClose();
  };

  return (
    <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
      <Typography variant="subtitle1" flexGrow={1}>
        {title}
      </Typography>
      <IconButton
        edge="end"
        aria-label="more"
        size="large"
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "file-menu" : undefined}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "file-button",
        }}
      >
        <MenuItem onClick={handleDownloadFile}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download File</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteFile}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete File</ListItemText>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};
