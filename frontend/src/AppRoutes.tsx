import { withAuthenticationRequired } from "@auth0/auth0-react";
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
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreateLibraryModal } from "./components/CreateLibraryModal";
import { MenuBar } from "./components/MenuBar";
import useAppBarHeight from "./hooks/useAppBarHeight";
import { axiosInstance } from "./lib";
import { LibraryContainer } from "./pages/LibraryContainer";
import { Library, LibraryResponse } from "./types/apiTypes";

const RootComponent = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const barHeight = useAppBarHeight();

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
                <ListItemButton onClick={() => navigate({ to: `/${lib.id}` })}>
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
        <CreateLibraryModal open={open} handleClose={handleClose} />
      </Box>
    </Box>
  );
};

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <Stack direction="column" spacing={2} p={2}>
      <h3>Welcome to NeuraLib</h3>
      <Typography variant="body1">Create a library to get started!</Typography>
    </Stack>
  );
}

export const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$libraryId",
  // component: LibraryPage,
  component: LibraryContainer,
});

const routeTree = rootRoute.addChildren([indexRoute, libraryRoute]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
});

const ProtectedRoutes = () => {
  return <RouterProvider router={router} />;
};

export const AppRoutes = withAuthenticationRequired(ProtectedRoutes);
