import { LibraryAddOutlined, LibraryMusicOutlined } from "@mui/icons-material";
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
import { Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { CreateLibraryModal } from "../components/CreateLibraryModal";
import { MenuBar } from "../components/MenuBar";
import useAppBarHeight from "../hooks/useAppBarHeight";
import { axiosInstance } from "../lib";
import { useActiveLibraryStore } from "../store/activeLibraryStore";
import { LibraryResponse } from "../types";

export const RootComponent = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const barHeight = useAppBarHeight();
  const setLibrary = useActiveLibraryStore.use.setLibrary();

  const { data: libraries } = useQuery({
    queryKey: ["libraries"],
    queryFn: async () => {
      const res = await axiosInstance.get<LibraryResponse>("/api/libraries");
      return res.data;
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLibraryClicked = (libraryId: string) => {
    setLibrary(libraryId);
    navigate({ to: `/${libraryId}` });
  };

  if (!libraries) return null;
  return (
    <Box sx={{ display: "flex", height: "100%", widht: "100%" }}>
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
                <ListItemText primary={"Create Library"} />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            {libraries.map((lib, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleLibraryClicked(lib.id)}>
                  <ListItemIcon>
                    <LibraryMusicOutlined />
                  </ListItemIcon>
                  <ListItemText primary={lib.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          height: `calc(100% - ${barHeight}px)`,
          width: "100%",
          pt: `${barHeight}px`,
        }}
      >
        <Outlet />
        <TanStackRouterDevtools />
        <CreateLibraryModal open={open} handleClose={handleClose} />
      </Box>
    </Box>
  );
};

export const RootErrorComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/" });
  }, [navigate]);

  return null;
};
