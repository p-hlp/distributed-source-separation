import { MoreVert } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { memo } from "react";

interface AudioPlayerMenuProps {
  anchorEl: null | HTMLElement;
  isOpen: boolean;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
  menuItems: {
    label: string;
    action: () => void;
  }[];
}

export const AudioPlayerMenu = memo(
  ({ anchorEl, isOpen, onClose, onOpen, menuItems }: AudioPlayerMenuProps) => {
    return (
      <>
        <IconButton
          onClick={(event) => (isOpen ? onClose() : onOpen(event))}
          sx={{ width: "48px", height: "48px" }}
        >
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={isOpen} onClose={onClose}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);
