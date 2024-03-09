import { Delete, MoreVert } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { queryClient } from "../lib/queryClient";
import { libraryApi } from "../sections/api/libraryApi";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";
import { Library } from "../types";

const formatTitle = (name: string, description?: string) => {
  return description ? `${name} - ${description}` : name;
};

interface Props {
  library: Library;
}

export const HeaderComponent = ({
  library: { id, name, description },
}: Props) => {
  const api = libraryApi();
  const resetFile = useActiveFileStore.use.resetFile();
  const resetLibrary = useActiveLibraryStore.use.resetLibrary();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  const handleDeleteLibrary = async () => {
    await api.DELETE(id);
    handleClose();
    resetFile();
    resetLibrary();
    await queryClient.invalidateQueries({ queryKey: ["libraries"] });
    navigate({ to: "/" });
  };

  return (
    <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>
        {formatTitle(name, description)}
      </Typography>
      <IconButton
        edge="end"
        aria-label="more"
        size="large"
        onClick={handleClick}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "library-menu" : undefined}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="library-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "library-button",
        }}
      >
        <MenuItem onClick={handleDeleteLibrary}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Library</ListItemText>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};
