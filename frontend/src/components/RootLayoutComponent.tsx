import {
  LibraryAddOutlined,
  LibraryMusicOutlined,
  Outlet,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib";
import { Library, LibraryResponse } from "../types/apiTypes";
import { CreateLibraryModal } from "./CreateLibraryModal";
import { MenuBar } from "./MenuBar";

export const RootLayoutComponent = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // TODO - use activeLibrary to pass title to MenuBar
  const [activeLibrary, setActiveLibrary] = useState<undefined | Library>(
    undefined
  );

  const { data: libraries } = useQuery({
    queryKey: ["libraries"],
    queryFn: async () => {
      const res = await axiosInstance.get<LibraryResponse>("/api/libraries");
      return res.data;
    },
  });

  useEffect(() => {
    if (libraries && libraries.length > 0) {
      setActiveLibrary(libraries[0]);
      navigate({ to: `/${libraries[0].id}` });
    }
  }, [libraries, navigate]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  console.log("libraries", libraries);

  return (
    <Box sx={{ display: "flex" }}>
      <MenuBar />
      <Drawer
        variant="permanent"
        sx={{
          width: theme.spacing(30),
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: theme.spacing(30),
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem key={"Library"} disablePadding>
              <ListItemButton onClick={handleOpen}>
                <ListItemIcon>
                  <LibraryAddOutlined />
                </ListItemIcon>
                <ListItemText primary={"Library"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            {libraries &&
              libraries.map((lib, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => navigate({ to: `/${lib.id}` })}
                  >
                    <ListItemIcon>
                      <LibraryMusicOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={lib.name}
                      secondary={lib.description}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 2 }}>
        <Outlet />
        <CreateLibraryModal open={open} handleClose={handleClose} />
      </Box>
    </Box>
  );
};
