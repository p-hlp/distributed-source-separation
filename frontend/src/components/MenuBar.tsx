import { useAuth0 } from "@auth0/auth0-react";
import { Logout } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useActiveFileStore } from "../store/activeFileStore";
import { useActiveLibraryStore } from "../store/activeLibraryStore";

export const MenuBar = () => {
  const { isAuthenticated, user, logout } = useAuth0();
  const navigate = useNavigate();
  const { resetLibrary } = useActiveLibraryStore();
  const { resetFile, resetChildFile } = useActiveFileStore();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const navigateToHome = () => {
    resetLibrary();
    resetFile();
    resetChildFile();
    navigate({ to: "/" });
  };

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar disableGutters>
        <Typography
          variant="h6"
          noWrap
          component="a"
          onClick={navigateToHome}
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
            pl: 2,
            cursor: "pointer",
          }}
        >
          NeuraLib
        </Typography>
        <Box flexGrow={1} />
        {isAuthenticated && (
          <Stack direction="row" spacing={2} alignItems="center" pr={0.5}>
            <Typography
              sx={{
                fontFamily: "monospace",
                color: "inherit",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {user?.name}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              aria-label="Logout"
              edge="end"
              size="large"
            >
              <Logout />
            </IconButton>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};
