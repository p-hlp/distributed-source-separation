import { useAuth0 } from "@auth0/auth0-react";
import { Logout } from "@mui/icons-material";
import {
  AppBar,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

export const MenuBar = () => {
  const { isAuthenticated, user, logout } = useAuth0();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            NeuraLib
          </Typography>
          {isAuthenticated && (
            <Stack direction="row" spacing={2} alignItems="center">
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
      </Container>
    </AppBar>
  );
};
